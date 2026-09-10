import json, pathlib, subprocess, sys, time
root = pathlib.Path('/Users/leanbot/Documents/40_Daidalon/features/20-workspace-git')
evidence = root / '.project/tasks/DA20-002-contexte-local-verifiable/evidence'
env = json.loads((evidence/'check-environment.json').read_text())
name, package, *command = sys.argv[1:]
start = time.time()
result = subprocess.run(command, cwd=root/package, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
(evidence/(name+'.log')).write_text(result.stdout)
(evidence/(name+'.json')).write_text(json.dumps({'cwd':str(root/package),'command':command,'exit':result.returncode,'seconds':round(time.time()-start,2)},indent=2)+'\n')
print(name, 'exit', result.returncode)
print(result.stdout[-4500:])
sys.exit(result.returncode)
