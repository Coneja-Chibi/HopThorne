const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const chatSteps = [
  { id: 'chat-user-one', status: 'You send a message', delay: 900 },
  { id: 'chat-reply-one', status: 'The AI writes its reply', delay: 1100, typed: true },
  { id: 'chat-request', status: 'The reply requests a tool for next turn', delay: 1800 },
  { id: 'chat-user-two', status: 'You send the next message', delay: 1500 },
  { id: 'chat-loaded', status: 'The requested tool joins the next prompt', delay: 1700 },
  { id: 'chat-reply-two', status: 'The AI uses the tool, then writes the scene', delay: 0, typed: true }
];
const chatText = new Map(chatSteps.filter(step => step.typed).map(step => [step.id, byId(step.id).querySelector('.typed-text').textContent]));
document.querySelectorAll('.chat-tool-name').forEach(node => { node.textContent = exampleTool.name; });
byId('chat-request-code').textContent = byId('request-preview').textContent;
byId('chat-reply-call').textContent = callText(exampleTool);
let chatIndex = 0;
let characterIndex = 0;
let chatPlaying = false;
let chatTimer;
let chatStarted = false;
function setPlaying(playing) {
  chatPlaying = playing;
  byId('chat-play').textContent = playing ? 'Pause' : chatIndex >= chatSteps.length ? 'Play again' : 'Play example';
}
function clearChatTimer() { clearTimeout(chatTimer); }
function scrollTranscript() {
  const transcript = byId('chat-transcript');
  transcript.scrollTop = transcript.scrollHeight;
}
function resetChat() {
  clearChatTimer();
  chatIndex = 0;
  characterIndex = 0;
  chatSteps.forEach(step => {
    byId(step.id).hidden = true;
    if (step.typed) byId(step.id).querySelector('.typed-text').textContent = '';
  });
  byId('chat-idle').hidden = false;
  byId('chat-status').textContent = 'Ready to play';
  byId('chat-transcript').scrollTop = 0;
  setPlaying(false);
}
function advanceChat() {
  if (!chatPlaying) return;
  if (chatIndex >= chatSteps.length) {
    setPlaying(false);
    byId('chat-status').textContent = 'Example complete';
    return;
  }
  const step = chatSteps[chatIndex];
  byId(step.id).hidden = false;
  if (characterIndex === 0) byId('chat-status').textContent = step.status;
  if (step.id === 'chat-loaded') byId('chat-idle').hidden = true;
  if (step.typed && characterIndex < chatText.get(step.id).length) {
    characterIndex += 1;
    byId(step.id).querySelector('.typed-text').textContent = chatText.get(step.id).slice(0, characterIndex);
    scrollTranscript();
    chatTimer = setTimeout(advanceChat, 28);
    return;
  }
  chatIndex += 1;
  characterIndex = 0;
  scrollTranscript();
  chatTimer = setTimeout(advanceChat, step.delay);
}
function playChat() {
  chatStarted = true;
  if (motionPreference.matches || document.body.classList.contains('motion-paused')) { showCompleteChat(); return; }
  if (chatIndex >= chatSteps.length) resetChat();
  setPlaying(true);
  advanceChat();
}
function showCompleteChat() {
  clearChatTimer();
  chatStarted = true;
  chatIndex = chatSteps.length;
  chatSteps.forEach(step => {
    byId(step.id).hidden = false;
    if (step.typed) byId(step.id).querySelector('.typed-text').textContent = chatText.get(step.id);
  });
  byId('chat-idle').hidden = true;
  byId('chat-status').textContent = motionPreference.matches ? 'Complete example / reduced motion' : 'Complete example';
  setPlaying(false);
  scrollTranscript();
}
byId('chat-play').onclick = () => {
  if (chatPlaying) { clearChatTimer(); setPlaying(false); byId('chat-status').textContent = 'Paused'; }
  else playChat();
};
byId('chat-replay').onclick = () => { resetChat(); playChat(); };
byId('chat-finish').onclick = showCompleteChat;
byId('chat-controls').hidden = false;
motionPreference.addEventListener('change', () => { if (motionPreference.matches) showCompleteChat(); });
if (motionPreference.matches) showCompleteChat();
else {
  resetChat();
  const chatObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !chatStarted) { playChat(); chatObserver.disconnect(); }
  }, { threshold: 0.25 });
  chatObserver.observe(byId('chat-example'));
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && chatPlaying) { clearChatTimer(); setPlaying(false); byId('chat-status').textContent = 'Paused'; }
});
document.addEventListener('hop-motion-change', () => {
  if (document.body.classList.contains('motion-paused') && chatPlaying) {
    clearChatTimer(); setPlaying(false); byId('chat-status').textContent = 'Paused';
  }
});
