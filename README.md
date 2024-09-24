# Hub Load Test

1. Install Locust
```
    pip install 

    brew install locust - locally 
```
    
2. Config the path and payload in test scripts

3. Run tests
    headless
    locust -f ./test_scripts/test_get_api.py -u 100 -r 10 --host <endpoint> -t 5m --headless
    
    visual:
    locust -f path/to/test_script --host <endpoint>
    open http://localhost:8089/ to check result or reset parameters
