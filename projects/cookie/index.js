/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответствует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

import './cookie.html';

/*
 app - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#app');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

updateListTable('');

filterNameInput.addEventListener('input', function () {
  updateListTable(this.value);
});

addButton.addEventListener('click', () => {
  const name = addNameInput.value;
  const value = addValueInput.value;

  if (name) {
    const filterValue = filterNameInput.value;

    document.cookie = `${name} = ${value}`;
    updateListTable(filterValue);
  }

  addNameInput.value = '';
  addValueInput.value = '';
});

function getCookies() {
  const cookies = document.cookie.split('; ').reduce((prev, current) => {
    const [name, value] = current.split('=');
    prev[name] = value;
    return prev;
  }, {});

  return cookies;
}

function deleteCookie(name) {
  const date = new Date(0);
  document.cookie = name + '= ' + '; expires=' + date.toString();
}

function addRow(name, value) {
  const tr = document.createElement('tr');
  const fragment = document.createDocumentFragment();
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  const td3 = document.createElement('td');

  td1.innerText = name;
  td2.innerText = value;
  td3.innerHTML = '<button id="del-button">удалить</button>';

  fragment.appendChild(td1);
  fragment.appendChild(td2);
  fragment.appendChild(td3);
  tr.appendChild(fragment);

  return tr;
}

listTable.addEventListener('click', (e) => {
  if (e.target.id === 'del-button') {
    const tr = e.target.closest('tr');

    if (tr) {
      const cookieName = tr.firstChild.innerText;

      deleteCookie(cookieName);
      tr.parentElement.removeChild(tr);
    }
  }
});

function isMatching(full, chunk) {
  return full.toLowerCase().includes(chunk.toLowerCase());
}

function updateListTable(filterValue) {
  const cookies = getCookies();
  const fragment = document.createDocumentFragment();

  for (const name in cookies) {
    if (isMatching(name, filterValue) || isMatching(cookies[name], filterValue)) {
      const row = addRow(name, cookies[name]);
      fragment.append(row);
    }
  }
  listTable.innerHTML = '';
  listTable.append(fragment);
}
