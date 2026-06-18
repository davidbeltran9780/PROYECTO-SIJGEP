from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(
    prefix="/ia",
    tags=["IA"]
)

def extraer_texto(contenido: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]

    if ext == "txt":
        return contenido.decode("utf-8", errors="ignore")

    elif ext == "pdf":
        import fitz
        doc = fitz.open(stream=contenido, filetype="pdf")
        texto = ""
        for pagina in doc:
            texto += pagina.get_text()
        return texto

    elif ext in ["docx", "doc"]:
        from docx import Document
        import io, zipfile, re
        try:
            doc = Document(io.BytesIO(contenido))
            return "\n".join([p.text for p in doc.paragraphs])
        except zipfile.BadZipFile:
            texto_raw = contenido.decode('latin-1', errors='ignore')
            fragmentos = re.findall(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s\.,;:\-\(\)\"\'\!]{5,}', texto_raw)
            texto = ' '.join(fragmentos).strip()
            if len(texto) < 50:
                raise HTTPException(status_code=400, detail="No se pudo leer el archivo .doc. Conviértelo a .docx o .pdf e inténtalo de nuevo.")
            return texto

    elif ext in ["jpg", "jpeg", "png"]:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(contenido))
        return f"[Imagen recibida: {filename} - {img.size[0]}x{img.size[1]} px]"

    else:
        raise HTTPException(status_code=400, detail=f"Formato .{ext} no soportado")


@router.get("/ia-test")
def prueba_ia():
    return {"mensaje": "IA funcionando"}


@router.post("/resumir")
async def resumir_documento(archivo: UploadFile = File(...)):
    try:
        from google import genai

        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        contenido = await archivo.read()
        print(f"Archivo recibido: {archivo.filename}, tamaño: {len(contenido)} bytes")

        texto = extraer_texto(contenido, archivo.filename)
        print(f"Texto extraído: {len(texto)} caracteres")

        if texto == "__DOC_ANTIGUO__":
            return {"archivo": archivo.filename, "resumen": "TIPO: No procesado\n\nRESUMEN: El archivo .doc es formato Word antiguo y no puede leerse directamente. Por favor guárdalo como .docx (Archivo > Guardar como > Word (.docx)) o expórtalo como .pdf e inténtalo de nuevo.\n\nNORMAS: N/A\n\nBORRADOR: N/A"}

        if not texto.strip():
            return {"archivo": archivo.filename, "resumen": "El documento está vacío o no se pudo leer el texto."}

        respuesta = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"""Eres un abogado experto de una alcaldía colombiana con amplio conocimiento en derecho administrativo, constitucional y PQRS. Tu función es analizar documentos jurídicos y producir análisis detallados, precisos y profesionales. Responde SIEMPRE en este formato exacto, sin omitir ninguna sección:

TIPO: [Tutela / Demanda / Peticion / Queja / Reclamo / Sugerencia / Otro]

PARTES:
Accionante/Solicitante: [nombre completo, documento de identidad si aparece, dirección o correo si aparece]
Accionado/Destinatario: [entidad o persona demandada]
Apoderado: [si aparece, nombre y tarjeta profesional]

HECHOS:
[Lista numerada con TODOS los hechos relevantes del documento. Cada hecho debe ser una oración completa y precisa. Incluir fechas, cifras, nombres de funcionarios, actos administrativos, resoluciones o comunicaciones mencionadas. Mínimo 5 hechos si el documento lo permite.]

PRETENSIONES:
[Lista numerada de exactamente lo que solicita el accionante. Ser literal con el documento.]

RESUMEN:
[Análisis jurídico completo de 400 a 600 palabras. Incluir: (1) contexto y antecedentes del caso, (2) análisis de los hechos y su relevancia jurídica, (3) derechos o normas presuntamente vulnerados o invocados, (4) posición jurídica recomendada para la alcaldía, (5) riesgos procesales si los hay, (6) recomendaciones concretas de actuación.]

NORMAS:
[Lista completa de normas aplicables con descripción de por qué aplica cada una. Incluir artículo específico cuando sea posible. Ejemplos: Constitución Política art. 23 (derecho de petición), art. 86 (tutela); Ley 1437 de 2011 CPACA arts. 13-33 (PQRS); Ley 1755 de 2015 (derecho de petición); Decreto 2591 de 1991 (tutela); Ley 1581 de 2012 (protección de datos); Ley 80 de 1993 (contratos estatales si aplica); Ley 136 de 1994 (municipios). Solo incluir las que realmente apliquen.]

BORRADOR:
[Genera el borrador en texto plano, sin colores, sin negrillas, sin viñetas especiales, sin encabezados con diseño. Solo texto formal corrido con saltos de linea. Sigue la plantilla segun el tipo detectado:

Si es TUTELA, usa esta estructura exacta:
---
[Ciudad], [fecha actual]

Señor(a)
[JUZGADO — deducir del documento o escribir "DESPACHO JUDICIAL"]
E.S.D.

REFERENCIA: ACCION DE TUTELA
RADICADO: [numero si aparece en el documento, si no: "Pendiente de asignacion"]
ACCIONANTE: [nombre del accionante segun el documento]
ACCIONADA: ALCALDIA MUNICIPAL

Asunto: CONTESTACION ACCION DE TUTELA

El suscrito funcionario, actuando en representacion de la Alcaldia Municipal, dentro del termino legal me permito dar contestacion a la accion de tutela de la referencia, en los siguientes terminos:

I. PRONUNCIAMIENTO FRENTE A LOS HECHOS

[Analizar cada hecho del documento y dar la posicion de la alcaldia frente a el. Ser conciso pero juridicamente solido.]

II. CONSIDERACIONES

[Incluir argumentos juridicos: si hay otros mecanismos de defensa, si no hay vulneracion de derecho fundamental, o si la alcaldia ya actuo conforme a la ley.]

III. FUNDAMENTOS DE DERECHO

Con fundamento en el articulo 86 de la Constitucion Politica, el Decreto 2591 de 1991 y demas normas concordantes.

IV. PRUEBAS

Documentales: las que obren en el expediente administrativo de esta entidad relacionadas con el presente caso.

V. PETICIONES

Con base en lo expuesto, solicito al Despacho declarar IMPROCEDENTE o NEGAR la accion de tutela de la referencia, por las razones expuestas.

VI. NOTIFICACIONES

La Alcaldia Municipal recibira notificaciones en [direccion de la alcaldia].

Cordialmente,

_______________________________
Firma del funcionario responsable
Cargo: ____________________________
ALCALDIA MUNICIPAL
---

Si es PETICION o DERECHO DE PETICION, usa esta estructura exacta:
---
Radicado interno: [numero o "Por asignar"]
[Ciudad], [fecha actual]

Señor(a)
[NOMBRE DEL PETICIONARIO segun el documento]
[Correo si aparece en el documento]
Ciudad

ASUNTO: Respuesta a derecho de peticion radicado [numero si existe]

Respetado(a) Señor(a):

En atencion a su peticion recibida por esta entidad, nos permitimos dar respuesta en los siguientes terminos:

[Dar respuesta de fondo a lo solicitado segun el contenido del documento. Ser claro y concreto.]

De conformidad con el articulo 14 de la Ley 1437 de 2011, sustituido por el articulo 1 de la Ley 1755 de 2015, toda peticion debera resolverse dentro de los quince (15) dias siguientes a su recepcion.

Es necesario precisar que la respuesta se ofrece dentro del ambito de nuestra competencia.

Atentamente,

_______________________________
[DEPENDENCIA COMPETENTE]
ALCALDIA MUNICIPAL
---

Si es QUEJA o RECLAMO, usa esta estructura exacta:
---
Radicado interno: [numero o "Por asignar"]
[Ciudad], [fecha actual]

Señor(a)
[NOMBRE segun el documento]
[Correo si aparece]
Ciudad

ASUNTO: Respuesta a [queja/reclamo] radicado [numero si existe]

Respetado(a) Señor(a):

En atencion a la [queja/reclamo] presentada ante esta entidad, nos permitimos manifestar:

[Dar respuesta de fondo. Si la queja tiene fundamento, indicar que medidas se tomaran. Si no tiene fundamento, explicar por que con argumentos concretos.]

De conformidad con la Ley 1437 de 2011 y la Ley 1755 de 2015, hemos dado tramite a su solicitud dentro de los terminos legales establecidos.

Atentamente,

_______________________________
[DEPENDENCIA COMPETENTE]
ALCALDIA MUNICIPAL
---

Si es SUGERENCIA, usa esta estructura:
---
Radicado interno: [numero o "Por asignar"]
[Ciudad], [fecha actual]

Señor(a)
[NOMBRE segun el documento]
[Correo si aparece]
Ciudad

ASUNTO: Respuesta a sugerencia radicada [numero si existe]

Respetado(a) Señor(a):

Agradecemos su participacion ciudadana y la sugerencia presentada ante esta entidad.

[Analizar la sugerencia y dar respuesta sobre si sera tenida en cuenta, que area la evaluara, y en que terminos podria implementarse.]

Su sugerencia ha sido remitida a la dependencia competente para su evaluacion y posible implementacion.

Atentamente,

_______________________________
[DEPENDENCIA COMPETENTE]
ALCALDIA MUNICIPAL
---
]

Documento:
{texto[:10000]}"""
)

        return {
            "archivo": archivo.filename,
            "resumen": respuesta.text
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        msg = str(e)
        print(f"ERROR: {msg}")
        if "503" in msg or "UNAVAILABLE" in msg or "high demand" in msg:
            return {"error": msg, "resumen": "⚠️ El servicio de IA está temporalmente saturado. Por favor intenta de nuevo en unos minutos."}
        return {"error": msg, "resumen": f"No se pudo generar el análisis: {msg}"}
