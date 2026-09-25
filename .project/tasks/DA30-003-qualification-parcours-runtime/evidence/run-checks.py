from pathlib import Path
import os,subprocess,json
r=Path(__file__).resolve().parents[4]
t=r/'.project/tasks/DA30-003-qualification-parcours-runtime'; rt=t/'evidence/runtime'
for d in ['home','tmp','data','cache','config','state']: (rt/d).mkdir(exist_ok=True)
env={'PATH':str(rt)+':/usr/bin:/bin:/usr/sbin:/sbin','HOME':str(rt/'home'),'TMPDIR':str(rt/'tmp'),'XDG_DATA_HOME':str(rt/'data'),'XDG_CACHE_HOME':str(rt/'cache'),'XDG_CONFIG_HOME':str(rt/'config'),'XDG_STATE_HOME':str(rt/'state'),'OPENCODE_TEST_HOME':str(rt/'home'),'OPENCODE_DISABLE_MODELS_FETCH':'true','OPENCODE_DISABLE_AUTOUPDATE':'true','RECORD':'false','CI':'true'}
checks=[('client-route','packages/app',['test','--conditions=solid','src/utils/server-compat.test.ts','src/utils/server-protocol.test.ts']),('admission-placement','packages/core',['test','test/session-prompt.test.ts','test/session-run-coordinator.test.ts','test/location.test.ts']),('mutation-controls','packages/core',['test','test/location-mutation.test.ts','test/file-mutation.test.ts','test/tool-write.test.ts','test/tool-edit.test.ts','test/tool-apply-patch.test.ts','test/tool-bash.test.ts']),('core-typecheck','packages/core',['run','typecheck'])]
out=[]
for name,cwd,args in checks:
 cmd=[str(rt/'bun')]+args
 with (t/f'evidence/{name}.log').open('w') as f:
  result=subprocess.run(cmd,cwd=r/cwd,env=env,stdout=f,stderr=subprocess.STDOUT)
 out.append({'name':name,'cwd':str(r/cwd),'command':cmd,'exit':result.returncode})
 (t/'evidence/checks.json').write_text(json.dumps(out,indent=2)+'\n')
 print(name,result.returncode,flush=True)
