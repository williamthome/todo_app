defmodule TodoApp.Repo.Migrations.TodosAddPositionColumn do
  use Ecto.Migration

  def change do
    alter table("todos") do
      add :position, :integer
    end
  end
end
