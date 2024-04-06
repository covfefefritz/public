#include <algorithm>
#include <string>
#include <assert.h>

std::string triangle(std::string row_str) {
  std::string new_row{};
  
  for(unsigned long i{} ; i < row_str.length()-1 ; i++){
    char left{row_str.at(i)};
    char right{row_str.at(i+1)};
    
    if (left == right){
      new_row.push_back(left);
    }
    while (new_row.length() <= i){
      if (left == 'R' && right == 'G'){
        new_row.push_back('B');
      }
      if(left == 'B' && right == 'G'){
        new_row.push_back('R');
      }
      if(left == 'B' && right == 'R'){
        new_row.push_back('G');
      }
      std::swap(left, right);
    }
  }
  if(row_str.length() != 1){row_str = triangle(new_row);}
  return row_str;
}


int main(){

    assert(triangle("GB") == "R");
    assert(triangle("RGBG") == "B");
    assert(triangle("RBRGBRB") == "G");
    assert(triangle("RBRGBRBGGRRRBGBBBGG") == "G");
    assert(triangle("B") == "B");

}