// selecting alert element and remove it
export const hideAlert = () => {
    // console.log('this is from hideAlert');
    const el = document.querySelector('.alert');
    // el.parentElement=> body
    if (el) el.parentElement.removeChild(el);
};
// if type==='success'=> green alert else red alert
export const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}" >${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    // console.log('this is from show alert');
    window.setTimeout(() => hideAlert(), 4000);
};
