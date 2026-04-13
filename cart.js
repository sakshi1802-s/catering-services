document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.querySelector(".cart-icon");
    const cartPopup = document.getElementById("cart-popup");
    
    cartIcon.addEventListener("click", () => {
      cartPopup.style.display = cartPopup.style.display === "none" ? "block" : "none";
    });
  });

const backToTopButton = document.getElementById("backToTop");

window.onscroll = function () {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
     backToTopButton.style.display = "block";
  } else {
     backToTopButton.style.display = "none";
  }
};

backToTopButton.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const testimonials = document.querySelectorAll('.testimonial');
let current = 0;
const total = testimonials.length;

function showTestimonial(index) {
  testimonials.forEach((testimonial, i) => {
    if (i === index) {
      gsap.to(testimonial, { opacity: 1, y: 0, duration: 1 });
      testimonial.classList.add('active');
    } else {
      gsap.to(testimonial, { opacity: 0, y: 20, duration: 1 });
      testimonial.classList.remove('active');
    }
  });
}

function nextTestimonial() {
  current = (current + 1) % total;
  showTestimonial(current);
}


showTestimonial(current);

// Auto-slide every 5 seconds
setInterval(nextTestimonial, 5000);

