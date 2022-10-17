/**
 * Lookup for the first draggable element.
 *
 * @param {HTMLElement} elem
 * @returns {HTMLElement|null}
 */
function draggableLookup(elem) {
    if (!elem) return null
    if (elem.draggable) return elem
    if (elem.parentElement) return draggableLookup(elem.parentElement)
    return null
}

const buildHandler = (eventHandler, eventName, hook) => function (e) {
    e.name = eventName
    e.hook = hook
    e.draggable = () => draggableLookup(e.target)
    e.draggableLookup = (target = e.target) => draggableLookup(target)

    switch (eventName) {
        case "dragstart":
            e.dataTransfer.clearData()
            break
        case "dragenter":
            e.preventDefault()
            break
        case "dragover":
            e.preventDefault()
            break
        case "drop":
            e.stopPropagation()
            break
    }

    const handle = eventHandler.bind(this)
    handle(e)

    switch (eventName) {
        case "drop":
            return false
    }
}

/**
 * Phoenix Hook.
 * @see https://hexdocs.pm/phoenix_live_view/js-interop.html#client-hooks-via-phx-hook
 *
 * @typedef {Object} Hook
 * @property {*} mounted
 * @property {*} beforeUpdate
 * @property {*} updated
 * @property {*} destroyed
 * @property {*} disconnected
 * @property {*} reconnected
 */

/**
 * Event handler.
 *
 * @callback EventHandler
 * @param {DragEvent} event - Drag event.
 * @returns {void}
 */

/**
 * @param {EventHandler} eventHandler - Event name.
 * @param {DragEvent} dragEvent - Drag event.
 * @returns {Hook} - Phoenix hook
 */
function dragFactory(eventHandler) {
    return {
        mounted() {
            const hook = this

            const events = [
                "dragstart",
                "dragover",
                "dragenter",
                "dragleave",
                "dragend",
                "drop",
            ]

            events.forEach(eventName => {
                this.el.addEventListener(
                    eventName,
                    buildHandler(eventHandler, eventName, hook),
                    false
                )
            })
        }
    }
}

let dragElements = []
let dragElemIndex = -1
let overElemIndex = -1
let dropped = false

export default dragFactory(
    /** @this HTMLElement */
    function (e) {
        const DRAG_CLASS = "drag-elem"
        const DRAGGING_CLASS = "dragging"
        const DRAGOVER_CLASS = "drag-elem-hover"
        const DROPAREA_CLASS = "drop-area"
        const HOLDER_CLASS = "drag-content"

        function elemIndex(elem) {
            if (!elem || !elem.id) return -1
            return dragElements.findIndex(({ id }) => id === elem.id)
        }

        function getElem(index) {
            return document.getElementById(dragElements[index].id)
        }

        function getDragElem() {
            return getElem(dragElemIndex)
        }

        function getOverElem() {
            return getElem(overElemIndex)
        }

        function getHolder(elem) {
            return elem.getElementsByClassName(HOLDER_CLASS)[0]
        }

        function swapInnerContent(from, to) {
            getHolder(from).innerHTML = getHolder(to).innerHTML
        }

        switch (e.name) {
            case "dragstart":
                for (const child of this.children) {
                    dragElements.push(child.cloneNode(true))
                }

                const dragElem = e.draggable()
                dragElem.classList.add(DRAG_CLASS)
                dragElemIndex = elemIndex(dragElem)

                this.classList.add(DRAGGING_CLASS)
                this.dataset.done = dragElem.dataset.done
                break
            case "dragend":
                function dragEnd() {
                    this.classList.remove(DRAGGING_CLASS)
                    dragElemIndex = -1
                    overElemIndex = -1
                    dragElements.length = 0
                    dropped = false
                }
                const doDragEnd = dragEnd.bind(this)

                if (dropped) {
                    const dragElem = getDragElem()
                    const dropElem = getOverElem()

                    const from = dragElem.dataset.id
                    const to = dropElem.dataset.id

                    e.hook.pushEvent("drop", {from, to}, function(reply) {
                        switch(reply.result) {
                            case "ok":
                                dragElem.outerHTML = dragElements[overElemIndex].outerHTML
                                dropElem.outerHTML = dragElements[dragElemIndex].outerHTML
                                break
                            case "error":
                                dragElem.outerHTML = dragElements[dragElemIndex].outerHTML
                                dropElem.outerHTML = dragElements[overElemIndex].outerHTML
                                alert(reply.reason)
                                break
                        }
                        doDragEnd()
                    })
                } else {
                    dragElemIndex > -1 && getDragElem().classList.remove(DRAG_CLASS)
                    overElemIndex > -1 && getOverElem().classList.remove(DRAGOVER_CLASS)
                    doDragEnd()
                }
                break
            case "dragenter":
                const enterDraggable = e.draggable()
                const enterElemIndex = elemIndex(enterDraggable)

                if (
                    enterElemIndex > -1 &&
                    enterElemIndex !== dragElemIndex &&
                    enterElemIndex !== overElemIndex &&
                    enterDraggable.dataset.done === dragElements[dragElemIndex].dataset.done
                ) {
                    enterDraggable.classList.add(DRAGOVER_CLASS)

                    swapInnerContent(getDragElem(), enterDraggable)
                    swapInnerContent(enterDraggable, dragElements[dragElemIndex])

                    overElemIndex = enterElemIndex
                }
                break
            case "dragleave":
                if (overElemIndex > -1 && e.target.classList.contains(DROPAREA_CLASS)) {
                    const leaveDraggable = e.draggable()
                    leaveDraggable.classList.remove(DRAGOVER_CLASS)

                    swapInnerContent(getDragElem(), dragElements[dragElemIndex])
                    swapInnerContent(leaveDraggable, dragElements[overElemIndex])

                    overElemIndex = -1
                }
                break
            case "drop":
                const dropDraggable = e.draggable()
                const dropElemIndex = elemIndex(dropDraggable)

                dropped =
                    dropDraggable &&
                    dropElemIndex !== dragElemIndex &&
                    dropDraggable.dataset.done === dragElements[dragElemIndex].dataset.done
                break
    }
})
