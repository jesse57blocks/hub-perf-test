from locust import HttpUser, task, between
from src.utils.api import send_post_request, send_get_request
from src.utils.common import get_config

import csv
import os


def read_csv_file(file_path):
    with open(file_path, 'r') as csvfile:
        reader = csv.reader(csvfile)
        lines = [line for line in reader]
        return lines


class UserBehavior(HttpUser):
    wait_time = between(1, 5)
    headers = {
        'Next-Action': '4bb3c690c4758b1deb49ab27129bac517ea77d04',
        'Accept': 'text/x-component'
    }

    @task
    def test_post_many(self):
        # Get the current directory
        current_dir = os.path.dirname(__file__)
        # Go up two levels
        grandparent_dir = os.path.dirname(current_dir)
        # Construct the file path
        file_path = os.path.join(grandparent_dir, 'test_data', 'address_id.csv')
        allData = read_csv_file(file_path)

        for data in allData:
            payload = [{"address": "0x4e11bA73EE81Cc85E8e1b5FeBF8eBF7963622B8E", "token": "dummy", "id": "", "provider": "Gitcoin", "score": 0}]
            payload[0]['address'] = data[0]
            print(payload)

            with self.client.post('https://odyssey.faucet.story.foundation', json=payload, headers=self.headers, catch_response=True) as response:
                result = '"result":true' in response.text
                
                # print(response.text)
                print('response code', response.status_code)
                print('wallet', data[0])

                if result:
                    response.success()
                else:
                    response.failure("assertion error")
