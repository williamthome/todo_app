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

let dragElem = null
let overElem = null
// let overElemHTML = null
// let overElemId = null

export default dragFactory(
    /** @this HTMLElement */
    function (e) {
        switch (e.name) {
            case "dragstart":
                this.classList.add("my-dragging")
                dragElem = e.draggable()
                dragElem.classList.add("my-drag-elem")
                break
            case "dragend":
                dragElem.classList.remove("my-drag-elem")

                // overElemHTML = null
                // overElemId = null
                this.classList.remove("my-dragging")

                dragElem = null
                overElem = null

                break
            case "dragenter":
                const enterElem = e.draggable()
                const enterElemId = enterElem?.dataset?.id
                if (enterElem && e.target.classList.contains("my-drop-area") && enterElemId !== dragElem.dataset.id && enterElemId !== overElem?.dataset.id) {
                    overElem = enterElem.cloneNode(true)
                    // overElemId = enterElemId
                    enterElem.classList.add("drag-over")
                    // console.log(overElemHTML)
                    console.log(enterElemId, dragElem.dataset.id)
                    const enterTodoHolder = enterElem.getElementsByClassName("my-todo-holder")[0]
                    // overElemHTML = enterTodoHolder.innerHTML
                    enterTodoHolder.innerHTML = dragElem.getElementsByClassName("my-todo-holder")[0].innerHTML
                }
                break
            case "dragleave":
                const leaveElem = e.draggable()
                const leaveElemId = leaveElem?.dataset?.id
                if (leaveElem && e.target.classList.contains("my-drop-area") && leaveElemId && overElem && leaveElemId === overElem.dataset.id) {
                    console.log(overElem)
                    leaveElem.classList.remove("drag-over")
                    // console.log(overElemHTML)
                    // console.log(leaveElemId, dragElem.dataset.id)
                    const leaveTodoHolder = leaveElem.getElementsByClassName("my-todo-holder")[0]
                    // console.log(overElemHTML)
                    leaveTodoHolder.innerHTML = overElem.getElementsByClassName("my-todo-holder")[0].innerHTML
                    // overElemId = null
                    overElem = null
                }
                break
            case "drop":
                for (const elem of this.getElementsByClassName("drag-over")) {
                    elem.classList.remove("drag-over")
                }
                if (overElem && overElem.dataset.id !== dragElem.dataset.id) {
                    // console.log(overElem.dataset.id)
                    const overElemId = overElem.dataset.id
                    overElem.dataset.id = dragElem.dataset.id
                    console.log(overElem.dataset.id, dragElem.dataset.id)
                    dragElem.dataset.id = overElemId
                    dragElem.getElementsByClassName("my-todo-holder")[0].innerHTML = overElem.getElementsByClassName("my-todo-holder")[0].innerHTML
                    console.log(overElem.dataset.id, dragElem.dataset.id)
                }
                // overElemHTML = null
                // overElemId = null
                // dragElem = null
                // overElem = null


                break



        // case "dragstart":
        //     const draggable = dragEvent.draggableLookup()
        //     dragEvent.dataTransfer.effectAllowed = "all"
        //     dragEvent.dataTransfer.dropEffect = "move"
        //     dragEvent.dataTransfer.setData("todo-id", draggable.dataset.id)
        //     dragEvent.currentTarget.classList.add("dragging")
        //     dragEvent.currentTarget.dataset.draggingId = draggable.dataset.id

        //     // for (elem of dragEvent.currentTarget.querySelectorAll(".todo:not(dragging)")) {
        //     //     elem.classList.add("drop-area")
        //     // }
        //     break
        // case "dragenter":
        //     if (!dragEvent.target.classList.contains("drop-area")) return

        //     const draggingId = dragEvent.currentTarget.dataset.draggingId
        //     console.log(document.getElementById(`todo-${draggingId}`))

        //     dragEvent.target.innerHTML = document.getElementById(`todo-${draggingId}`).outerHTML
        //     dragEvent.target.classList.remove("drop-area")
        //     dragEvent.target.classList.add("todo")
        //     dragEvent.target.classList.add("todo-drop-area")
        //     break
        // case "dragleave":
        //     if (!dragEvent.target.classList.contains("todo-drop-area")) return
        //     // dragEvent.target.classList.remove("todo")
        //     dragEvent.target.outerHTML = `<div class="drop-area"></div>`
        //     // dragEvent.target.classList.add("drop-area")
        //     break
        // case "dragend":
        //     delete dragEvent.currentTarget.dataset.draggingId;
        //     dragEvent.currentTarget.classList.remove("dragging")
        //     // for (elem of dragEvent.currentTarget.querySelectorAll(".drop-area")) {
        //     //     elem.classList.remove("drop-area")
        //     // }
        //     break
        // case "drop":
        //     const droppable = dragEvent.draggableLookup()
        //     if (!droppable) return

        //     const droppableId = droppable.dataset.id
        //     const todoId = dragEvent.dataTransfer.getData("todo-id")
        //     if (!droppableId || droppableId === todoId) return
        //     hook.pushEvent("drop", {
        //         from: todoId,
        //         to: droppableId,
        //     })
        //     break
    }
})
