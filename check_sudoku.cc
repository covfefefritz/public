#include <fstream>
#include <vector> 
#include <iostream>
#include <algorithm>
#include <numeric>
#include <iomanip>

class Square{
    public: 
        void insert(int c){
            vals.push_back(c);
        }
        bool check_square(){
            if (vals.size() != 9){return false;}
            std::vector<int> nums(9);
            std::iota(nums.begin(), nums.end(), 1);

            for(int i : nums){
                if (1 < std::count(vals.begin(),vals.end(), '0'+i)){
                    return false; 
                }
            }
            return true; 
        }

        std::vector<char> get_line(int line){
            std::vector<char> result;
            result.push_back(vals[line*3]);
            result.push_back(vals[line*3+1]);
            result.push_back(vals[line*3+2]);
            return result; 
        }
        std::vector<char> get_col(int col){
            std::vector<char> result;
            result.push_back(vals[col]);
            result.push_back(vals[col+3]);
            result.push_back(vals[col+6]);
            return result; 
        }
        private:
        std::vector<char> vals;
};

class Sudoku{
    public: 
        void add_square(Square* square){
            squares.push_back(square);
        }
        void delete_squares(){
            for(auto square : squares){
                delete square;
            }
        }

        std::vector<char> get_line(int line){
            std::vector<char> result; 
            int square{};
            int squareline{};
            if(line < 3){
                square = 0;
                squareline = line;  
            }
            else if(line > 2 && line < 6){
                square = 3;
                squareline = line-3; 
            }
            else{
                square = 6;
                squareline = line-6;
            }
            for(int i{} ; i<3 ; i++){
                auto part = squares[square]->get_line(squareline);
                std::copy(part.begin(), part.end(), std::back_inserter(result));
                square++;
            }
            return result;
        }

        bool check_lines(){
            std::vector<int> nums(9);
            std::iota(nums.begin(), nums.end(), 1);
            
            for(int j : nums){
                auto vals = this->get_line(j-1);
                for(int i : nums){
                    if (1 < (std::count(vals.begin(),vals.end(), '0'+i))
                        || (std::count(vals.begin(),vals.end(), '0'+i)) == 0){
                        return false; 
                    }
                }
            }
            return true; 
        }

        std::vector<char> get_col(int col){
            std::vector<char> result; 
            int square{};
            int squarecol{};
            if(col<3){
                square=0;
                squarecol=col; 
            }
            else if(col > 2 && col < 6){
                square=1; 
                squarecol=col-3; 
            }
            else{
                square=2;
                squarecol=col-6;
            }
            for(int i{} ; i<3 ; i++){
                auto part = squares[square]->get_col(squarecol);
                std::copy(part.begin(), part.end(), std::back_inserter(result));
                square+=3;
            }
            return result;
        }

        bool check_cols(){
            std::vector<int> nums(9);
            std::iota(nums.begin(), nums.end(), 1);
            
            for(int j : nums){
                auto vals = this->get_col(j-1);
                for(int i : nums){
                    if (1 < (std::count(vals.begin(),vals.end(), '0'+i))
                        || (std::count(vals.begin(),vals.end(), '0'+i)) == 0){
                        return false; 
                    }
                }
            }
            return true; 
        }

        void print_sudoku(){
            std::cout << std::setfill('-') << std::setw(26) << '\n';
            for(int i{} ; i < 9 ; i++){
                std::cout <<"|"; 
                auto x = get_line(i); 
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                std::replace(x.begin(), x.end(), (char)((rand()%8)+1+'0'), ' ' );
                for(int j{} ; j < 9 ; j++){
                    std::cout << std::setfill(' ')<< std::setw(2) << x[j];
                    if(j == 2 || j == 5){
                        std::cout << std::setw(2) << "|";}
                }
                std::cout <<" |" << '\n';  
                if(i== 2 || i == 5){
                    std::cout << std::setfill('-') << std::setw(26) << '\n';}
            }
            std::cout << std::setfill('-') << std::setw(26) << '\n';
        }
    private:
        std::vector<Square*> squares; 
};

char dice(){
    return (rand()%8)+1+'0';
}



int main(){
    std::ifstream fin; 
    fin.open("sudoku.txt");
    Sudoku* sudoku = new Sudoku;
    std::vector<Sudoku*> collection; 
    char c; 
    if(fin.is_open()){
        Square* square = new Square;
        bool goodsquare{true};
        int numcount{};
        int sqrcount{};
        while(fin >> c){     
            if(c != '-'){
                square->insert(c);
                numcount++;
            }
            if(numcount == 9){
                if(!square->check_square()){goodsquare = false;} //because we want to finish reading anyways
                sudoku->add_square(square);
                sqrcount++;
                square = new Square;
                numcount = 0;
            }
            if(sqrcount == 9){
                if(goodsquare && sudoku->check_cols() && sudoku->check_lines()){
                    collection.push_back(sudoku);
                    sudoku = new Sudoku;
                    std::cout << "Saved a valid sudoku! \n";
                }
                else{
                    sudoku->delete_squares();
                    delete sudoku; 
                    delete square; 
                    square = new Square; 
                    sudoku = new Sudoku;
                    goodsquare = true;
                    std::cout << "Removed a bad one! \n";

                }
                sqrcount = 0;
                numcount = 0;    
            }
        }
    }else{
        std::cout << "File read error \n";
    }
    int count{1};
    for(auto x : collection){
        std::cout << "Valid sudoku #"<<count << '\n';
        x->print_sudoku();
        count++;
        x->delete_squares();
        delete x; 
    }
}