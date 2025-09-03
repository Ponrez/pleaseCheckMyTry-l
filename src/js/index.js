// Бургер
const menu = document.querySelector(".header__nav");
const menuBtn = document.querySelector(".header__icon");
const headerLogoWrapper = document.querySelector(".header__logo-wrapper");

const body = document.body;

if (menu && menuBtn) {
  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
    menuBtn.classList.toggle("active");
    headerLogoWrapper.classList.toggle("active");
    body.classList.toggle("lock");
  });

  menu.querySelectorAll(".header__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      menuBtn.classList.remove("active");
      headerLogoWrapper.classList.remove("active");
      body.classList.remove("lock");
    });
  });
}

// //////////////////////////////////////////////
// Ссылки якоря

document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href*="#"]');
  if (!a) return;

  const href = a.getAttribute("href");
  if (!href || href === "#" || /^(https?:)?\/\//i.test(href)) return;

  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;

  const id = href.slice(hashIndex + 1).trim();
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ///////////////////////////////////////////////
// Слайдер
// import Swiper from "swiper/bundle";
// import "swiper/css/bundle";

const swiper = new Swiper(".reviews__swiper", {
  slidesPerView: 1,
  spaceBetween: 26,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    1230: {
      slidesPerView: 3,
      spaceBetween: 32,
    },
    698: {
      slidesPerView: 2,
      spaceBetween: 28,
    },
  },
  navigation: {
    nextEl: ".reviews__swiper-button-next",
    prevEl: ".reviews__swiper-button-prev",
  },
});

// /////////////////////////////////////////////
// Аккордеон
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq__item");

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq__header");

    header.addEventListener("click", () => {
      const isActive = item.classList.contains("faq__item--active");

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("faq__item--active");
      });

      if (!isActive) {
        item.classList.add("faq__item--active");
      }
    });
  });
});
// ///////////////////////////////////////////////
// Форма
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form__body");
  if (!form) return;

  const API_URL = "https://jsonplaceholder.typicode.com/posts";
  const submitBtn = form.querySelector(".form__submit");
  const nameInput = form.elements["name"];
  const phoneInput = form.elements["phone"];
  const agreeInput = form.elements["agreement"];

  const MSG = {
    name: "Введите имя (мин. 2 символа)",
    phone: "Введите корректный телефон",
    send: "Не удалось отправить. Попробуйте позже.",
  };

  const setState = (input, type, msg = "") => {
    input.classList.remove("form__input--success", "form__input--error");
    const helper = input
      .closest(".form__field")
      ?.querySelector(".form__helper");
    if (helper) helper.textContent = "";
    if (type === "success") input.classList.add("form__input--success");
    if (type === "error") {
      input.classList.add("form__input--error");
      if (helper && msg) helper.textContent = msg;
    }
  };

  const validateName = (el) => {
    const ok = el.value.trim().length >= 2;
    setState(el, ok ? "success" : "error", ok ? "" : MSG.name);
    return ok;
  };

  const validatePhone = (el) => {
    const ok = /^\+?\d{10,15}$/.test(el.value.replace(/[^\d+]/g, ""));
    setState(el, ok ? "success" : "error", ok ? "" : MSG.phone);
    return ok;
  };

  const validateAgree = (el) => {
    const label = form.querySelector(".form__checkbox-label");
    if (!el.checked) {
      label?.classList.add("is-error");
      return false;
    }
    label?.classList.remove("is-error");
    return true;
  };

  const validateForm = () =>
    validateName(nameInput) &
    validatePhone(phoneInput) &
    validateAgree(agreeInput); 

  form.addEventListener("input", (e) => {
    if (
      e.target === nameInput &&
      nameInput.classList.contains("form__input--error")
    )
      validateName(nameInput);
    if (
      e.target === phoneInput &&
      phoneInput.classList.contains("form__input--error")
    )
      validatePhone(phoneInput);
  });
  form.addEventListener(
    "blur",
    (e) => {
      if (e.target === nameInput) validateName(nameInput);
      if (e.target === phoneInput) validatePhone(phoneInput);
    },
    true
  );
  agreeInput.addEventListener("change", () => validateAgree(agreeInput));

  async function sendForm(payload) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok)
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.querySelectorAll(".form__helper").forEach((h) => (h.textContent = ""));

    if (!validateForm()) return;

    submitBtn.disabled = true;
    const oldText = submitBtn.textContent;
    submitBtn.textContent = "Отправляем…";

    try {
      await sendForm({
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        agreement: agreeInput.checked,
      });

      alert("Заявка отправлена!");
      form.reset();
      form
        .querySelectorAll(".form__input")
        .forEach((i) =>
          i.classList.remove("form__input--error", "form__input--success")
        );
      form
        .querySelectorAll(".form__helper")
        .forEach((h) => (h.textContent = ""));
    } catch (err) {
      console.error(err);

      const anyHelper =
        phoneInput.closest('.form__field')?.querySelector('.form__helper') ||
        nameInput.closest('.form__field')?.querySelector('.form__helper');

      if (anyHelper) {
        anyHelper.textContent = 'Не удалось отправить. Попробуйте позже.';
      } else {
        alert(`Не удалось отправить: ${err.message || err}`);
      }

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = oldText;
    }
  });
});

