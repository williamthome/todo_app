defmodule TodoAppWeb.TodoLiveTest do
  use TodoAppWeb.LiveCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "TODO"
  end
end
