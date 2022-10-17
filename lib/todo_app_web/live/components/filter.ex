defmodule TodoAppWeb.Components.Filter do
  use Phoenix.Component

  def filter(assigns) do
    ~H"""
    <button
      type="button"
      class={"filter #{if Map.get(@filter, :selected), do: "selected"}"}
      phx-click={@filter_event}
      phx-value-name={@filter.name}
    >
      <%= @filter.label %>
    </button>
    """
  end
end
