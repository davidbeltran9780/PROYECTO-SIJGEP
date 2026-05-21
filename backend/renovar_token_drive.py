"""
Ejecuta este script UNA VEZ para renovar el token de Google Drive.
Abrirá el navegador para que inicies sesión con tu cuenta de Google.
Luego guarda el nuevo token.pickle y puedes borrar este script.

Uso:
    python renovar_token_drive.py
"""
import pickle
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.pickle"

creds = None

if os.path.exists(TOKEN_FILE):
    with open(TOKEN_FILE, "rb") as token:
        creds = pickle.load(token)

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        print("Intentando renovar token automáticamente...")
        creds.refresh(Request())
    else:
        print("Abriendo navegador para autenticación con Google Drive...")
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        creds = flow.run_local_server(port=0)

    with open(TOKEN_FILE, "wb") as token:
        pickle.dump(creds, token)
    print("✅ Token guardado correctamente en token.pickle")
else:
    print("✅ El token ya es válido, no necesita renovación")
