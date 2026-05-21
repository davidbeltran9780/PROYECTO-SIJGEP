from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Date
from sqlalchemy.sql import func
from database import Base

class PQRS(Base):
    __tablename__ = "pqrs"

    id_pqrs = Column(Integer, primary_key=True, index=True)
    numero_radicado = Column(String(50), unique=True, nullable=False)
    nombre_ciudadano = Column(String(255), nullable=False)
    correo = Column(String(120), nullable=False)
    tipo = Column(Enum("peticion", "queja", "reclamo", "sugerencia", "derecho_peticion"), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(Enum("recibido", "en_proceso", "respondido", "cerrado"), default="recibido")
    id_caso = Column(Integer, nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_vencimiento = Column(Date, nullable=True)
    respuesta = Column(Text, nullable=True)