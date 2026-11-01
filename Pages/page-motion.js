const starRepo = document.querySelector('.star-repo');
function danceStar() {
  if (motionPreference.matches) return;
  starRepo.querySelector('svg').animate([
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(-5px) rotate(-16deg)', offset: .25 },
    { transform: 'translateY(-3px) rotate(16deg)', offset: .55 },
    { transform: 'translateY(-2px) rotate(-8deg)', offset: .8 },
    { transform: 'translateY(0) rotate(0deg)' }
  ], { duration: 480, easing: 'ease-out' });
}
starRepo.addEventListener('pointerdown', danceStar);
starRepo.addEventListener('keydown', event => { if (event.key === 'Enter') danceStar(); });
const revealElements = document.querySelectorAll('.how .section-head,.steps article,.chat-example .section-head,.library .section-head,.install-inner,.last>div');
revealElements.forEach(element => element.classList.add('motion-reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: 0.08 });
revealElements.forEach(element => revealObserver.observe(element));
const computer = document.querySelector('.computer');
let tiltFrame;
computer.addEventListener('pointermove', event => {
  if (motionPreference.matches || document.body.classList.contains('motion-paused') || event.pointerType === 'touch') return;
  const box = computer.getBoundingClientRect();
  const tilt = Math.max(-2.5, Math.min(2.5, ((event.clientX - box.left) / box.width - .5) * 5));
  cancelAnimationFrame(tiltFrame);
  tiltFrame = requestAnimationFrame(() => computer.style.setProperty('--tilt', tilt + 'deg'));
});
computer.addEventListener('pointerleave', () => { cancelAnimationFrame(tiltFrame); computer.style.setProperty('--tilt', '0deg'); });
document.addEventListener('visibilitychange', () => document.body.classList.toggle('tab-hidden', document.hidden));
