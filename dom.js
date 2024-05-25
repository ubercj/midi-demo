/**
 * @param {HTMLElement} parent
 * @param {string} tag
 * @param {string} content
 * @param {string} [id]
 *
 * @returns {HTMLElement} The newly created element
 */
export const addElement = (parent, tag, content, id) => {
  const newElement = document.createElement(tag);
  if (id) {
    newElement.id = id;
  }
  newElement.textContent = content;
  parent.appendChild(newElement);

  return newElement;
};

export const updateElement = (el, content) => {
  el.textContent = content;
};
