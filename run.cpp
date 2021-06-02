#include <string>
#include <windows.h>
#include <iostream>
using namespace std;

int main() {
  string name = "", path = "", new_name = "", season = "", episode = "";
  char c;
  
  cout << "Enter name : ";
  while(c = cin.get()) {
	  if(c == '\n') break;
	  name += c;
  }
  
  cout << "Enter new name : ";
  while(c = cin.get()) {
	  if(c == '\n') break;
	  new_name += c;
  }
  
  cout << "Enter path : ";
  while(c = cin.get()) {
	  if(c == '\n') break;
	  path += c;
  }
  
  cout << "Enter season : ";
  while(c = cin.get()) {
	  if(c == '\n') break;
	  season += c;
  }
  
  cout << "Enter episode : ";
  while(c = cin.get()) {
	  if(c == '\n') break;
	  episode += c;
  }
	
  string command = "node index.js";
  if(name.size() > 0) command += string(" ") + name;
  if(path.size() > 0) command += string(" --path ") + path;
  if(new_name.size() > 0) command += string(" --name ") + new_name;
  if(season.size() > 0) command += string(" --season ") + season;
  if(episode.size() > 0) command += string(" --episode ") + episode;
 
  cout<<command<<endl; 
  system(command.c_str());
}