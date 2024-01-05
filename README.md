# FileSystem
This is a in-memory filesystem built in JavaScript.

Please note: There are two files in this repository, one is the main FileSystem.js file which is my official submission.

There is a second file called FileSystem_extended which includes my attempts at the other extension options (Copying files/directories, supporting reading and writing file contents as a stream of bytes, and walking through all the recursive contents of a directory).

I did not include these extensions in my official submission as I did not have enough time to thoroughly test these functions but still wanted to display my efforts at attempting them.


To run this program, please first install node, then use the following command:

node FileSystem.js


Running the command will start a shell-like program with a command line interface where you can run the following commands:

cd - change directory

pwd - show current directory

touch file.txt - creates text file called file.txt

mkdir test - creates directory/folder called test

ls - displays current directories content



rm - removes files or empty directory

rm non_empty_directory -r - NOTE: to delete a non-empty directory, please use -r at the end



echo file_name "content" - adds content to file

cat file_name - displays content of file



mv file_name /test - moves file to test directory regardless of if that directory has already been created or not



find - use find command to find file/directory in current directory NOTE: must use exact file/directory name



ln file.txt hard.txt - creates hardlink linking hard.txt to file.txt

ln file.txt sym.txt -s - creates symlink linking sym.txt to file.txt - NOTE: use -s at end to create symlink instead of hardlink




USE ls -l to get more detailed information on files/directories in current directory, which will confirm hardlink or symlink was created and which file it is linking to




Chosen Extension:


Permissions and multiple users (chmod and chown) 



chmod file.txt 700



chown file.txt newowner



USE ls -l to test and verify that the file's permissions and/or ownership has been modified and updated
