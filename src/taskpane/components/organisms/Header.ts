/* eslint-disable no-undef */
export interface HeaderProps {
  title?: string;
}

export function createHeader({ title = "office_Agent" }: HeaderProps) {
  const header = document.createElement("header");
  header.className = "mol-header";
  header.setAttribute("aria-label", title);

  const top = document.createElement("div");
  top.className = "header-top";

  const brand = document.createElement("div");
  brand.className = "header-brand";

  const logo = document.createElement("img");
  logo.src = "../../assets/logo-premium.png";
  logo.className = "header-logo-img";

  const h1 = document.createElement("h1");
  h1.className = "header-brand-name";
  h1.textContent = title;

  brand.appendChild(logo);
  brand.appendChild(h1);
  top.appendChild(brand);
  header.appendChild(top);

  return header;
}
