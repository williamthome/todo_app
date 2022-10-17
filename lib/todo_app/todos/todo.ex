defmodule TodoApp.Todos.Todo do
  use Ecto.Schema
  import Ecto.Changeset

  schema "todos" do
    field :done, :boolean, default: false
    field :title, :string
    field :position, :integer, default: 0

    timestamps()
  end

  @doc false
  def changeset(todo, attrs) do
    todo
    |> cast(attrs, [:title, :done, :position])
    |> validate_required([:title, :done, :position])
  end
end
