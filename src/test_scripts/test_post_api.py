from locust import HttpUser, task, between
from src.utils.api import send_post_request, send_get_request
from src.utils.common import get_config


class UserBehavior(HttpUser):
    wait_time = between(1, 5)

    @task
    def post_api(self):
        env_config = get_config('config.json')
        path = env_config['post']['path']
        headers = env_config['post']['headers']
        payload = env_config['post']['payload']

        send_post_request(self, path, headers, payload)
