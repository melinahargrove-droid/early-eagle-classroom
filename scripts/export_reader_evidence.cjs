// QA-only export: immutable original CI ZIP bytes, no app edits or deployment.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
module.exports=async({github,context,core})=>{
 const spec=JSON.parse(process.env.EVIDENCE_SPEC),{owner,repo}=context.repo;
 assert.equal(owner,'melinahargrove-droid');assert.equal(repo,'early-eagle-classroom');
 const artifact=(await github.rest.actions.getArtifact({owner,repo,artifact_id:spec.artifactId})).data;
 const run=(await github.rest.actions.getWorkflowRun({owner,repo,run_id:spec.runId})).data;
 assert.equal(artifact.id,spec.artifactId);assert.equal(artifact.name,spec.name);assert.equal(artifact.expired,false);
 assert.equal(artifact.workflow_run.id,spec.runId);assert.equal(artifact.workflow_run.head_sha,spec.head);
 assert.equal(run.head_sha,spec.head);assert.equal(run.status,'completed');assert.equal(run.conclusion,'success');
 assert.equal(artifact.digest,'sha256:'+spec.sha256);assert.equal(artifact.size_in_bytes,spec.bytes);
 const download=await github.rest.actions.downloadArtifact({owner,repo,artifact_id:spec.artifactId,archive_format:'zip'});
 assert(Buffer.isBuffer(download.data)||download.data instanceof ArrayBuffer||ArrayBuffer.isView(download.data),'Binary artifact response required');
 const bytes=Buffer.from(download.data);assert.equal(bytes.length,artifact.size_in_bytes);assert.equal(hash(bytes),spec.sha256,'Original archive SHA256');
 const destination=path.resolve(process.env.EVIDENCE_OUTPUT||'evidence-export');fs.mkdirSync(destination,{recursive:true});
 const parts=[],limit=20*1024*1024;
 for(let start=0;start<bytes.length;start+=limit){const data=bytes.subarray(start,Math.min(start+limit,bytes.length)),file='part-'+String(parts.length+1).padStart(2,'0')+'.bin';fs.writeFileSync(path.join(destination,file),data);parts.push({file,offset:start,bytes:data.length,sha256:hash(data)});}
 assert(parts.length<=8,'No unexported overflow parts');
 const restored=Buffer.concat(parts.map(p=>fs.readFileSync(path.join(destination,p.file))));assert(restored.equals(bytes));assert.equal(hash(restored),spec.sha256);
 fs.writeFileSync(path.join(destination,'evidence-export.json'),JSON.stringify({source:spec,originalBytes:bytes.length,originalSha256:hash(bytes),parts,exporterCommit:process.env.GITHUB_SHA||null,losslessRoundTrip:true},null,2)+'\n');
 core.info('Verified exact source archive and lossless '+parts.length+'-part export for '+spec.name);
 return parts.length;
};
