defmodule TodoAppWeb.Components.Filter do
  use Phoenix.Component

  def filter(assigns) do
    ~H"""
    <button
      type="button"
      phx-click={@filter_event}
      phx-value-name={@filter.name}
    >
      <%= @filter.label %>
      <%= if Map.get(@filter, :selected), do: "(Selected)" %>
    </button>
    """
  end
end
