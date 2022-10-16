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
// let dragElemHTML = null
// let dragElemId = null
// let overElemHTML = null
// let overElemId = null
// let overElemHTML = null
// let overElemId = null

export default dragFactory(
    /** @this HTMLElement */
    function (e) {
        function elemIndex(elem) {
            if (!elem || !elem.id) return -1
            return dragElements.findIndex(({ id }) => id === elem.id)
        }

        switch (e.name) {
            case "dragstart":
                console.log("start")

                for (const child of this.children) {
                    dragElements.push(child.cloneNode(true))
                }
                const dragElem = e.draggable()
                dragElemIndex = elemIndex(dragElem)

                console.log("start", dragElemIndex)

                this.classList.add("my-dragging")
                dragElem.classList.add("my-drag-elem")
                // dragElemId = dragElem.id

                break
            case "dragend":
                console.log("end")

                // if (!dropped) {
                //     document.getElementById(dragElements[dragElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                //         dragElements[dragElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML
                //     if (overElemIndex > -1) {
                //         document.getElementById(dragElements[overElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                //             dragElements[overElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML
                //     }
                // }

                // this.classList.remove("my-dragging")
                // dragElemIndex > -1 && document.getElementById(dragElements[dragElemIndex].id).classList.remove("my-drag-elem")
                // overElemIndex > -1 && document.getElementById(dragElements[overElemIndex].id).classList.remove("drag-over")

                // document.getElementById(dragElemId).classList.remove("my-drag-elem")

                // overElemHTML = null
                // overElemId = null

                // dragElemId = null
                // overElemId = null

                this.classList.remove("my-dragging")

                if (dropped) {
                    const dragElem = document.getElementById(dragElements[dragElemIndex].id)
                    const dropElem = document.getElementById(dragElements[overElemIndex].id)
                    dragElem.outerHTML = dragElements[overElemIndex].outerHTML
                    dropElem.outerHTML = dragElements[dragElemIndex].outerHTML
                } else {
                    dragElemIndex > -1 && document.getElementById(dragElements[dragElemIndex].id).classList.remove("my-drag-elem")
                    overElemIndex > -1 && document.getElementById(dragElements[overElemIndex].id).classList.remove("drag-over")
                }

                dragElemIndex = -1
                overElemIndex = -1
                dragElements.length = 0
                dropped = false

                break
            case "dragenter":
                const enterDraggable = e.draggable()
                const enterElemIndex = elemIndex(enterDraggable)
                if (enterElemIndex > -1 && enterElemIndex !== dragElemIndex && enterElemIndex !== overElemIndex) {
                    console.log("enter")
                    enterDraggable.classList.add("drag-over")
                    document.getElementById(dragElements[dragElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                        enterDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML
                    enterDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[dragElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML
                    overElemIndex = enterElemIndex
                }

                // if (!overElemId && e.target.classList.contains("my-drop-area")) {
                //     const enterElem = e.draggable()
                //     if (enterElem.id !== dragElemId) {
                //         // overElemId = enterElemId
                //         enterElem.classList.add("drag-over")
                //         // console.log(overElemHTML)
                //         const enterTodoHolder = enterElem.getElementsByClassName("my-todo-holder")[0]
                //         // overElemHTML = enterTodoHolder.innerHTML
                //         enterTodoHolder.innerHTML = document.getElementById(dragElemId).getElementsByClassName("my-todo-holder")[0].innerHTML
                //         overElemId = enterElem.id
                //     }
                // }
                break
            case "dragleave":
                if (overElemIndex > -1 && e.target.classList.contains("my-drop-area")) {
                    console.log("leave")

                    const leaveDraggable = e.draggable()
                    document.getElementById(dragElements[dragElemIndex].id).getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[dragElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML
                    leaveDraggable.getElementsByClassName("my-todo-holder")[0].innerHTML =
                        dragElements[overElemIndex].getElementsByClassName("my-todo-holder")[0].innerHTML

                    leaveDraggable.classList.remove("drag-over")
                    overElemIndex = -1
                }
                // if (overElemIndex > -1 && leaveElemIndex > -1 && leaveElemIndex === overElemIndex) {
                //     const leaveDraggable = e.draggable()
                //     console.log("leave")
                //     overElemIndex = -1
                // }

                // if (overElemId && e.target.classList.contains("my-drop-area")) {
                //     const leaveElem = e.draggable()
                //     if (leaveElem.id !== dragElemId) {
                //         leaveElem.classList.remove("drag-over")
                //         const leaveTodoHolder = leaveElem.getElementsByClassName("my-todo-holder")[0]
                //         leaveTodoHolder.innerHTML = document.getElementById(overElemId).getElementsByClassName("my-todo-holder")[0].innerHTML
                //         overElemId = null
                //     }
                // }
                // const leaveElem = e.draggable()
                // const leaveElemId = leaveElem?.dataset?.id
                // if (leaveElem && e.target.classList.contains("my-drop-area") && leaveElemId && overElem && leaveElemId === overElem.dataset.id) {
                //     console.log(overElem)
                //     leaveElem.classList.remove("drag-over")
                //     // console.log(overElemHTML)
                //     // console.log(leaveElemId, dragElem.dataset.id)
                //     const leaveTodoHolder = leaveElem.getElementsByClassName("my-todo-holder")[0]
                //     // console.log(overElemHTML)
                //     leaveTodoHolder.innerHTML = overElem.getElementsByClassName("my-todo-holder")[0].innerHTML
                //     // overElemId = null
                //     overElem = null
                // }
                break
            case "drop":
                const dropDraggable = e.draggable()
                const dropElemIndex = elemIndex(dropDraggable)
                if (dropElemIndex !== dragElemIndex) {
                    // dropDraggable.classList.remove("drag-over")
                    console.log("drop")



                    dropped = true
                }
                // for (const elem of this.getElementsByClassName("drag-over")) {
                //     elem.classList.remove("drag-over")
                // }
                // if (overElem && overElem.dataset.id !== dragElem.dataset.id) {
                //     // console.log(overElem.dataset.id)
                //     const overElemId = overElem.dataset.id
                //     overElem.dataset.id = dragElem.dataset.id
                //     console.log(overElem.dataset.id, dragElem.dataset.id)
                //     dragElem.dataset.id = overElemId
                //     dragElem.getElementsByClassName("my-todo-holder")[0].innerHTML = overElem.getElementsByClassName("my-todo-holder")[0].innerHTML
                //     console.log(overElem.dataset.id, dragElem.dataset.id)
                // }
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
