from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from database import get_db
from sqlalchemy import text
import os
import subprocess
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
import pickle

load_dotenv()

router = APIRouter(
    prefix="/backups",
    tags=["Backups"]
)

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS", "credentials.json")
TOKEN_FILE = "token.pickle"
DRIVE_FOLDER_ID = os.getenv("DRIVE_FOLDER_ID")

def obtener_servicio_drive():
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "wb") as token:
            pickle.dump(creds, token)
    return build("drive", "v3", credentials=creds)

@router.post("/manual")
def backup_manual():
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"backup_sigjep_{timestamp}.sql"
        ruta_archivo = f"backups/{nombre_archivo}"

        os.makedirs("backups", exist_ok=True)

        resultado = subprocess.run([
            r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
            "-u", os.getenv("MYSQL_USER", "root"),
            f"-p{os.getenv('MYSQL_PASSWORD', '')}",
            os.getenv("MYSQL_DB", "sigjep_db")
        ], capture_output=True, text=True)

        if resultado.returncode != 0:
            raise Exception(f"mysqldump error: {resultado.stderr}")

        with open(ruta_archivo, "w") as f:
            f.write(resultado.stdout)

        servicio = obtener_servicio_drive()
        metadata = {"name": nombre_archivo, "parents": [DRIVE_FOLDER_ID]}
        media = MediaFileUpload(ruta_archivo, mimetype="text/plain")
        archivo = servicio.files().create(body=metadata, media_body=media, fields="id").execute()

        drive_link = f"https://drive.google.com/file/d/{archivo.get('id')}"

        db_conn = next(get_db())
        db_conn.execute(
            text("""
                INSERT INTO backups_log (archivo, link_drive, creado_por, estado)
                VALUES (:archivo, :link_drive, :creado_por, :estado)
            """),
            {
                "archivo": nombre_archivo,
                "link_drive": drive_link,
                "creado_por": 1,
                "estado": "exitoso"
            }
        )
        db_conn.commit()

        return {
            "msg": "Backup creado y subido a Google Drive",
            "archivo": nombre_archivo,
            "drive_id": archivo.get("id"),
            "drive_link": drive_link
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listar")
def listar_backups():
    try:
        db_conn = next(get_db())
        resultado = db_conn.execute(
            text("SELECT * FROM backups_log ORDER BY fecha DESC")
        ).mappings().all()
        return [dict(r) for r in resultado]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))