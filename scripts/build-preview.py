from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,shutil,urllib.request,time
root=Path(__file__).resolve().parent.parent
out=root/'_site'
out.mkdir(exist_ok=True)
for pattern in ('*.html','*.css','robots.txt','.nojekyll'):
 for f in root.glob(pattern): shutil.copy2(f,out/f.name)
shutil.copytree(root/'js',out/'js',dirs_exist_ok=True)
shutil.copytree(root/'img',out/'img',dirs_exist_ok=True) if (root/'img').exists() else None
assets=json.loads((root/'preview-assets.json').read_text())
def fetch(item):
 path=item['path']
 if Path(path).is_absolute() or '..' in Path(path).parts: raise ValueError(path)
 target=out/path
 for attempt in range(3):
  try:
   data=urllib.request.urlopen(urllib.request.Request('https://malhao-pardo.pages.dev/'+path,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
   if hashlib.sha256(data).hexdigest()!=item['sha256']: raise ValueError('Asset changed: '+path)
   target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(data)
   return
  except Exception:
   if attempt==2: raise
   time.sleep(1)
with ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(fetch,assets))
print('Built preview with',len(assets),'verified media assets')
