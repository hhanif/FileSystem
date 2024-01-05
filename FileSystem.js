const readline = require("readline");

class FileSystem {
  constructor() {
    this.root = { type: "directory", name: "/", children: {} };
    this.currentDirectory = this.root;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  // Change the current directory
  cd(path) {
    const target = this.resolvePath(path);
    if (target && target.type === "directory") {
      this.currentDirectory = target;
      return true;
    } else {
      return false;
    }
  }

  // Get the current working directory
  pwd() {
    const path = [];
    let current = this.currentDirectory;

    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }

    return "/" + path.join("/");
  }

  // Create a new empty file
  touch(fileName) {
    this.currentDirectory.children[fileName] = {
      type: "file",
      name: fileName,
      content: "",
    };
  }

  // Create a new directory
  mkdir(directoryName) {
    this.currentDirectory.children[directoryName] = {
      type: "directory",
      name: directoryName,
      children: {},
      parent: this.currentDirectory,
    };
  }

  // Get the directory contents
  ls(details = false) {
    const items = Object.values(this.currentDirectory.children);

    if (!details) {
      // Return just the names
      return items.map((item) => item.name);
    }

    // Return directory contents with detailed information
    return items.map((item) => {
      if (item.type === "file") {
        return `${item.name} - File (permissions: ${item.permissions}, owner: ${item.owner})`;
      } else if (item.type === "directory") {
        return `${item.name} - Directory (permissions: ${item.permissions}, owner: ${item.owner})`;
      } else if (item.type === "symlink") {
        return `${item.name} - Symlink (target: ${item.target})`;
      } else if (item.type === "hardlink") {
        return `${item.name} - Hardlink (target: ${item.target})`;
      }
    });
  }

  // Remove a file or directory
  rm(name, recursive = false) {
    const target = this.currentDirectory.children[name];

    if (target) {
      if (
        (recursive && target.type === "directory") ||
        target.type === "symlink"
      ) {
        delete this.currentDirectory.children[name];
      } else if (
        (!recursive && target.type === "file") ||
        target.type === "hardlink"
      ) {
        delete this.currentDirectory.children[name];
      } else if (
        !recursive &&
        target.type === "directory" &&
        Object.keys(target.children).length === 0
      ) {
        delete this.currentDirectory.children[name];
      } else {
        return false; // Can't remove non-empty directory without -r
      }
      return true;
    } else {
      return false; // File or directory not found
    }
  }

  // Write file contents
  echo(fileName, contents) {
    const file = this.currentDirectory.children[fileName];
    if (file && file.type === "file") {
      file.content = contents;
    }
  }

  // Get file contents
  cat(fileName) {
    const file = this.currentDirectory.children[fileName];
    return file && file.type === "file" ? file.content : null;
  }

  // Move a file or directory within the same directory
  mv(source, destination) {
    const sourceItem = this.resolvePath(source);
    const destinationItem = this.resolvePath(destination);

    if (sourceItem) {
      if (destinationItem && destinationItem.type === "directory") {
        // Move the item within the same directory or to another directory
        const itemName = source.split("/").pop();
        const newDestinationPath =
          destination + (destination.endsWith("/") ? "" : "/") + itemName;

        // Determine the new destination path to ensure it's a valid destination
        const newDestination = this.resolvePath(newDestinationPath);
        if (!newDestination) {
          destinationItem.children[itemName] = sourceItem;
          delete this.currentDirectory.children[itemName];
          return true;
        }
      }
    }

    return false; // Unable to move the item
  }

  // Find a file or directory
  find(name) {
    return Object.values(this.currentDirectory.children).filter(
      (item) => item.name === name,
    );
  }

  // Create a symlink or hard link
  ln(targetPath, linkPath, isSymbolicLink = false) {
    const target = this.resolvePath(targetPath);
    const linkName = linkPath.split("/").pop();

    if (target) {
      const linkObject = {
        type: isSymbolicLink ? "symlink" : "hardlink",
        name: linkName,
        target: isSymbolicLink ? targetPath : targetPath,
        owner: target.owner,
        permissions: target.permissions,
      };

      this.currentDirectory.children[linkName] = linkObject;
      return true;
    } else {
      return false;
    }
  }

  // Helper function to resolve a path to an item in the filesystem
  resolvePath(path) {
    const components = path.split("/").filter((component) => component !== "");
    let current = this.currentDirectory;

    for (const component of components) {
      if (component === "..") {
        current = current.parent || current;
      } else if (component !== ".") {
        current = current.children[component];
        if (!current) return null; // Component not found
      }
    }

    return current;
  }

  // Helper function to resolve a directory path
  resolveDirectory(path) {
    const components = path.split("/").filter((component) => component !== "");
    let current = this.currentDirectory;

    for (let i = 0; i < components.length - 1; i++) {
      const component = components[i];
      if (component === "..") {
        current = current.parent || current;
      } else if (component !== ".") {
        current = current.children[component];
        if (!current) return null; // Component not found
      }
    }

    return current;
  }

  chmod(path, permissions) {
    const target = this.resolvePath(path);
    if (target) {
      target.permissions = permissions;
      return true;
    } else {
      return false;
    }
  }

  chown(path, owner) {
    const target = this.resolvePath(path);
    if (target) {
      target.owner = owner;
      return true;
    } else {
      return false;
    }
  }

  // Prompt the user
  promptUser() {
    this.rl.question("Enter a command: ", (command) => {
      this.processCommand(command.trim());
    });
  }

  // start the interactive CLI
  startInteractiveCLI() {
    // Initial prompt
    this.promptUser();

    this.rl.on("close", () => {
      console.log("Exiting...");
      process.exit(0);
    });
  }

  processCommand(command) {
    const args = command.split(" ");
    const cmd = args[0];

    switch (cmd) {
      case "cd":
        this.cd(args[1]);
        break;
      case "pwd":
        console.log(this.pwd());
        break;
      case "touch":
        this.touch(args[1]);
        break;
      case "mkdir":
        this.mkdir(args[1]);
        break;
      case "ls":
        const details = args.includes("-l");
        const listing = this.ls(details);

        console.log(listing.join("\n"));
        break;
      case "rm":
        this.rm(args[1], args[2] === "-r");
        break;
      case "echo":
        this.echo(args[1], args.slice(2).join(" "));
        break;
      case "cat":
        console.log(this.cat(args[1]));
        break;
      case "mv":
        this.mv(args[1], args[2]);
        break;
      case "find":
        console.log(this.find(args[1]));
        break;
      case "ln":
        this.ln(args[1], args[2], args[3] === "-s");
        break;
      case "chmod":
        this.chmod(args[1], args[2]);
        break;
      case "chown":
        this.chown(args[1], args[2]);
        break;
      case "exit":
        this.rl.close();
        break;
      default:
        console.log("Invalid command. Try again.");
    }

    // Continue prompting for the next command
    this.promptUser();
  }
}

// interactive CLI use:
const filesystem = new FileSystem();
filesystem.startInteractiveCLI();
