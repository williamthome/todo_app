defmodule TodoAppWeb.Components.Todo do
  use Phoenix.Component

  def todo(assigns) do
    ~H"""
    <div
      id={"todo-#{@todo.id}"}
      data-id={@todo.id}
      class="todo"
    >
      <pre><%= @todo.id %></pre>
      <label>
        <input
          type="checkbox"
          checked={@todo.done}
          phx-click={@toggle_done_event}
          phx-value-id={@todo.id}
        />
        <span><%= @todo.title %></span>
      </label>
      <button
        type="button"
        phx-click={@delete_event}
        phx-value-id={@todo.id}
      >
        X
      </button>
    </div>
    """
  end
end
