async function postJson(url, body){
  const res = await fetch(url, {
	method: 'POST',
	headers: {'Content-Type':'application/json'},
	body: body ? JSON.stringify(body) : undefined
  });
  if(!res.ok){
	const err = await res.json().catch(()=>({error:'Erro desconhecido'}));
	throw err;
  }
  return res.json();
}

async function init(){
  const cpEls = [document.getElementById('cp1'),document.getElementById('cp2'),document.getElementById('cp3')];
  const status = document.getElementById('status');
	const keyBox = document.getElementById('keyBox');
  const btnCheckpoint = document.getElementById('btnCheckpoint');
  const btnClaim = document.getElementById('btnClaim');
  const hasClaim = !!btnClaim;

  async function refresh(){
	const res = await fetch('/api/status');
	const st = await res.json();
	const cp = st.checkpoint || 0;
	cpEls.forEach((el,idx)=>{
	  el.classList.toggle('active', idx < cp);
	});
	status.textContent = `Checkpoint atual: ${cp} / 3`;
	// Somente manipula reivindicação quando o botão existir (apenas na página 3)
	if(hasClaim){
	  btnClaim.disabled = cp < 3;
	  if(btnClaim.disabled){
		btnClaim.classList.add('disabled');
		btnClaim.title = 'Complete os 3 checkpoints para reivindicar a key';
	  } else {
		btnClaim.classList.remove('disabled');
		btnClaim.title = '';
	  }
	}
  }

  btnCheckpoint.addEventListener('click', async ()=>{
	try{
	  const res = await postJson('/api/checkpoint');
	  await refresh();
	}catch(err){
	  console.error(err);
	}
  });

	if(hasClaim){
	btnClaim.addEventListener('click', async ()=>{
	  try{
		const res = await postJson('/api/claim');
		keyBox.textContent = res.key || 'Erro gerando key';
		keyBox.classList.add('revealed');
	  }catch(err){
		keyBox.textContent = err.error || (err.message || 'Erro');
		keyBox.classList.remove('revealed');
	  }
	  await refresh();
	});
  }

  await refresh();
}

window.addEventListener('load', init);
