from locust import HttpUser, task, between
from src.utils.api import send_get_request
from src.utils.common import get_config

paras = get_config('config.json')


class UserBehavior(HttpUser):
    wait_time = between(1, 5)

    @task
    def get_api(self):
        env_config = get_config('config.json')
        path = env_config['get']['path']
        headers = env_config['get']['headers']
        send_get_request(self, path, headers)
