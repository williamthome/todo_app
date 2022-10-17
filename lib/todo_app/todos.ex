defmodule TodoApp.Todos do
  @moduledoc """
  The Todos context.
  """

  import Ecto.Query, warn: false
  alias TodoApp.Repo

  alias TodoApp.Todos.Todo

  @doc """
  Returns the list of todos.

  ## Examples

      iex> list_todos()
      [%Todo{}, ...]

  """
  def list_todos do
    Repo.all(Todo)
  end

  @doc """
  Returns the list of sorted todos by done and then by title.

  Clause is optional.

  ## Examples

      iex> list_sorted_todos([done: true])
      [%Todo{}, ...]

  """
  def list_sorted_todos(clause \\ []) do
    from(
      t in Todo,
      where: ^clause,
      order_by: [asc: t.done, asc: t.position]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single todo.

  Raises `Ecto.NoResultsError` if the Todo does not exist.

  ## Examples

      iex> get_todo!(123)
      %Todo{}

      iex> get_todo!(456)
      ** (Ecto.NoResultsError)

  """
  def get_todo!(id), do: Repo.get!(Todo, id)

  @doc """
  Gets a single todo.

  Returns nil if no result was found.

  ## Examples

      iex> get_todo(123)
      %Todo{}

      iex> get_todo(456)
      nil

  """
  def get_todo(id), do: Repo.get(Todo, id)

  @doc """
  Gets a single todo and executes a callback function.

  Returns nil if no result was found.

  ## Examples

      iex> get_todo_and_callback(123, fn _todo -> ok end)
      {%Todo{}, ok}

      iex> get_todo_and_callback(456)
      nil

  """
  def get_todo_and_callback(id, callback) do
    case get_todo(id) do
      nil ->
        nil

      todo ->
        {todo, callback.(todo)}
    end
  end

  @doc """
  Creates a todo.

  ## Examples

      iex> create_todo(%{field: value})
      {:ok, %Todo{}}

      iex> create_todo(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_todo(attrs \\ %{}) do
    %Todo{
      position: Repo.aggregate(Todo, :count, :id)
    }
    |> Todo.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a todo.

  ## Examples

      iex> update_todo(todo, %{field: new_value})
      {:ok, %Todo{}}

      iex> update_todo(todo, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_todo(%Todo{} = todo, attrs) do
    todo
    |> Todo.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Updates todos position.

  ## Examples

      iex> update_position(0, 2)
      {:ok, :ok}

      iex> update_todo(-1, -1)
      {:error, any()}

  """
  def update_position(from_id, to_id) do
    result = Repo.transaction(fn ->
      [from_todo, to_todo] =
        from(
          t in Todo,
          where: t.id in [^from_id, ^to_id],
          order_by: [desc: t.id == ^from_id, desc: t.id == ^to_id]
        )
        |> Repo.all()

      from_position = from_todo.position
      to_position = to_todo.position

      from_changeset = change_todo(from_todo, %{position: to_position})
      Repo.update!(from_changeset)

      to_changeset = change_todo(to_todo, %{position: from_position})
      Repo.update!(to_changeset)

      :ok
    end)

    case result do
      {:ok, :ok} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Deletes a todo.

  ## Examples

      iex> delete_todo(todo)
      {:ok, %Todo{}}

      iex> delete_todo(todo)
      {:error, %Ecto.Changeset{}}

  """
  def delete_todo(%Todo{} = todo) do
    Repo.delete(todo)
  end

  @doc """
  Deletes all done todos.

  ## Examples

      iex> clear_completed()
      {1, nil}

  """
  def clear_completed do
    from(
      t in Todo,
      where: t.done
    )
    |> Repo.delete_all()
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking todo changes.

  ## Examples

      iex> change_todo(todo)
      %Ecto.Changeset{data: %Todo{}}

  """
  def change_todo(%Todo{} = todo, attrs \\ %{}) do
    Todo.changeset(todo, attrs)
  end
end
