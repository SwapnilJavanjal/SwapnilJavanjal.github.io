const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
  menuButton.querySelector('span').textContent = isOpen ? '+' : '−';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 651px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navigation.querySelectorAll('a').forEach(link => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
document.querySelector('#year').textContent = new Date().getFullYear();

const contactKey = window.SITE_CONTACT?.accessKey;
const contactButton = document.querySelector('.contact-open');
const contactDialog = document.querySelector('.contact-dialog');
const contactForm = document.querySelector('#contact-form');
// Only expose the form after its delivery destination has been configured.
if (typeof contactKey === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contactKey)) {
  document.querySelector('#contact-access-key').value = contactKey;
  contactButton.hidden = false;
  contactButton.addEventListener('click', () => contactDialog.showModal());
}
document.querySelector('.contact-close').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => contactButton.focus());
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = contactForm.querySelector('[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  if (!contactKey || submit.disabled || !contactForm.reportValidity()) return;
  submit.disabled = true;
  status.textContent = 'Sending your message…';
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error('Delivery failed');
    contactForm.reset();
    document.querySelector('#contact-access-key').value = contactKey;
    status.textContent = 'Thank you. Your message has been sent to Swapnil.';
  } catch {
    status.textContent = 'Your message could not be confirmed. Please try again or connect on LinkedIn below.';
  } finally {
    submit.disabled = false;
  }
});
