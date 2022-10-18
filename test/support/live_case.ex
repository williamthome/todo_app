defmodule TodoAppWeb.LiveCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import Phoenix.Component
      import Phoenix.LiveViewTest
      import TodoAppWeb.LiveCase

      alias TodoAppWeb.Router.Helpers, as: Routes

      # The default endpoint for testing
      @endpoint TodoAppWeb.Endpoint
    end
  end

  setup tags do
    TodoApp.DataCase.setup_sandbox(tags)
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end
end
