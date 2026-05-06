from sudotask.settings import resolve_database_host_port


def test_database_host_port_keeps_docker_defaults_in_container():
    host, port = resolve_database_host_port('db', '5432', in_container=True)
    assert host == 'db'
    assert port == '5432'


def test_database_host_port_falls_back_for_local_process_with_docker_defaults():
    host, port = resolve_database_host_port('db', '5432', in_container=False)
    assert host == 'localhost'
    assert port == '5433'


def test_database_host_port_respects_explicit_local_overrides():
    host, port = resolve_database_host_port('127.0.0.1', '6543', in_container=False)
    assert host == '127.0.0.1'
    assert port == '6543'
