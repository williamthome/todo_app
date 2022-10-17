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
        function elemIndex(elem) {
            if (!elem || !elem.id) return -1
            return dragElements.findIndex(({ id }) => id === elem.id)
        }

        switch (e.name) {
            case "dragstart":
                for (const child of this.children) {
                    dragElements.push(child.cloneNode(true))
                }

                const dragElem = e.draggable()
                dragElem.classList.add("my-drag-elem")

                dragElemIndex = elemIndex(dragElem)

                this.classList.add("my-dragging")
                this.dataset.done = dragElem.dataset.done
                break
            case "dragend":
                function dragEnd() {
                    this.classList.remove("my-dragging")
                    dragElemIndex = -1
                    overElemIndex = -1
                    dragElements.length = 0
                    dropped = false
                }
                const doDragEnd = dragEnd.bind(this)

                if (dropped) {
                    const dragElem = document.getElementById(dragElements[dragElemIndex].id)
                    const dropElem = document.getElementById(dragElements[overElemIndex].id)

                    const from = dragElem.dataset.id
                    const to = dropElem.dataset.id

                    e.hook.pushEvent("drop", {from, to}, function(reply) {
                        switch(reply.result) {
                            case "ok":
                                console.log("ok", from, to)
                                dragElem.outerHTML = dragElements[overElemIndex].outerHTML
                                dropElem.outerHTML = dragElements[dragElemIndex].outerHTML
                                break
                            case "error":
                                console.log("error", from, to, reply.reason)
                                dragElem.outerHTML = dragElements[dragElemIndex].outerHTML
                                dropElem.outerHTML = dragElements[overElemIndex].outerHTML
                                break
                        }
                        doDragEnd()
                    })
                } else {
                    dragElemIndex > -1 && document.getElementById(dragElements[dragElemIndex].id).classList.remove("my-drag-elem")
                    overElemIndex > -1 && document.getElementById(dragElements[overElemIndex].id).classList.remove("drag-over")
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
                    enterDraggable.classList.add("drag-over")

                    document.getElementById(dragElements[dragElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                        enterDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML
                    enterDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[dragElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML

                    overElemIndex = enterElemIndex
                }
                break
            case "dragleave":
                if (overElemIndex > -1 && e.target.classList.contains("my-drop-area")) {
                    const leaveDraggable = e.draggable()
                    leaveDraggable.classList.remove("drag-over")

                    document.getElementById(dragElements[dragElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[dragElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML
                    leaveDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[overElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML

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
