
def send_get_request(self, path, headers):
    response = self.client.get(path, headers=headers)
    if response.status_code != 200:
        print(f"API call failed with status code: {response.status_code}")
        print(f"POST request failed with status code: {response.text}")


def send_post_request(self, path, headers, payload):
    response = self.client.post(path, headers=headers, json=payload)

    if response.status_code != 200:
        print(f"POST request failed with status code: {response.status_code}")
        print(f"POST request failed with status code: {response.text}")

def send_post_request_with_files(self, path, headers, payload, files):
    response = self.client.post(path, headers=headers, json=payload, files=files)

    if response.status_code != 200:
        print(f"POST request failed with status code: {response.status_code}")
        print(f"POST request failed with status code: {response.text}")
