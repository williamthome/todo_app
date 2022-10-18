export default {
    updated() {
        const elems = this.el.querySelectorAll('[phx-reset]:not(.invalid-feedback)')
        for (const elem of elems) {
            elem.value = elem.getAttribute('phx-reset')
        }
    }
}
