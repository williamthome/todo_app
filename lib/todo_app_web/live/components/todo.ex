defmodule TodoAppWeb.Components.Todo do
  use Phoenix.Component

  def todo(assigns) do
    assigns =
      assigns
      |> assign(:id, "todo-#{assigns.todo.id}")
      |> assign(:checkbox_id, "todo-#{assigns.todo.id}-checkbox")

    ~H"""
    <div class="card">
      <div
        id={@id}
        data-id={@todo.id}
        class="card-body todo"
      >
        <div class="checkbox-container">
          <input
            id={@checkbox_id}
            type="checkbox"
            checked={@todo.done}
            class="checkbox-input checkbox-icon"
            phx-click={@toggle_done_event}
            phx-value-id={@todo.id}
          />
          <label for={@checkbox_id} class="checkbox-icon"></label>
          <label for={@checkbox_id} class="checkbox-label">
            <%= @todo.title %>
          </label>
        </div>
        <div class="actions">
          <button
            type="button"
            class="delete-btn"
            phx-click={@delete_event}
            phx-value-id={@todo.id}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>
          </button>
        </div>
      </div>
    </div>
    """
  end
end
