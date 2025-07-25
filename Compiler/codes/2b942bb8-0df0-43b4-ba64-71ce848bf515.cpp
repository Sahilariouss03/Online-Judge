#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    cin >> n;
    
    vector<int> nums(n);
    for(int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    
    cin >> target;
    
    unordered_map<int, int> map;
    for(int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if(map.find(complement) != map.end()) {
            cout << map[complement] << " " << i << endl;
            return 0;
        }
        map[nums[i]] = i;
    }
    
    cout << "No solution found" << endl;
    return 0;
}