/* KKT episodic story data. Fictional transaction; no payment API. */
try{
 const resetKey='jh_kkt_episode_KKT_EP001_content_v2';
 if(localStorage.getItem(resetKey)!=='1'){
  localStorage.removeItem('jh_kkt_episode_KKT_EP001');
  localStorage.setItem(resetKey,'1');
 }
}catch(e){}
window.__KKT_EPISODES__={
 KKT_EP001:{
  id:'KKT_EP001',name:'转账',contact:'xxx',mode:'AUTO',
  steps:[
   ['mine','계좌번호 보내줘','오전 10:05'],
   ['other','?','오후 12:06'],['other','무슨 뜻이야?','오후 12:06'],['mine','왜','오후 12:06'],
   ['other','나한테 돈 보내주려고?','오후 12:07'],['mine','ㅇ','오후 12:07'],
   ['other','ㅎ','오후 12:07'],['other','나 뭐로 보는 거야','오후 12:07'],
   ['other','카카오뱅크 3333-00-0000000 김여주','오후 12:08'],
   {type:'transfer',id:'KKT_EP001_TRANSFER',amount:100000,bank:'카카오뱅크',recipient:'김여주',account:'3333-00-0000000'},
   ['mine','보냈어','오후 12:08'],['mine','확인해봐','오후 12:09'],
   ['other','아니','오후 12:09'],['other','왜 이렇게 많아?','오후 12:09'],
   ['mine','🙂','오후 12:10'],['other','원래 뭐라 하려고 했는데','오후 12:10'],
   ['other','날 뭘로 보든 다 인정할게ㅎㅎ','오후 12:10'],['mine','별뜻없어','오후 12:10'],
   ['other','무슨 뜻이든 다 인정할게','오후 12:10'],
   ['other','오빠 이름이 뭐야','오후 12:11'],['mine','오빠','오후 12:11'],
   ['other','ㅋㅋㅋ','오후 12:11'],['other','아 웃기다 너','오후 12:11'],
   ['mine','지금 일하러 가야돼','오후 12:11'],['other','다음에또봐 오빠~','오후 12:11'],
   {type:'unsentDraft',text:'다음은 없어',time:'오후 12:12',holdMs:4000}
  ]
 }
};
