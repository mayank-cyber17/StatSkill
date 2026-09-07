import json
import os
import aiofiles
from app.core.config import get_settings

class StorageService:
    def __init__(self):
        self.settings = get_settings()
        if self.settings.USE_LOCAL_STORAGE:
            os.makedirs(self.settings.UPLOAD_DIR, exist_ok=True)
            
    async def save_file(self, file_bytes: bytes, filename: str, subdirectory: str = "") -> str:
        target_dir = os.path.join(self.settings.UPLOAD_DIR, subdirectory)
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, filename)
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_bytes)
            
        return os.path.join(subdirectory, filename).replace('\\', '/')
    
    async def get_file(self, file_path: str) -> bytes:
        full_path = os.path.join(self.settings.UPLOAD_DIR, file_path)
        async with aiofiles.open(full_path, 'rb') as f:
            return await f.read()
    
    async def delete_file(self, file_path: str):
        full_path = os.path.join(self.settings.UPLOAD_DIR, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    
    def get_file_url(self, file_path: str) -> str:
        return f"/uploads/{file_path}"
