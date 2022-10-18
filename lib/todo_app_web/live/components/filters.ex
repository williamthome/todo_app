defmodule TodoAppWeb.Components.Filters do
  use Phoenix.Component

  import TodoAppWeb.Components.Filter

  def filters(assigns) do
    ~H"""
    <%= for filter <- @filters do %>
      <.filter filter={filter} filter_event={@filter_event}/>
    <% end %>
    """
  end
end
