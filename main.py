import sys
import os
import subprocess
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget,
    QLineEdit, QPushButton, QLabel, QTableWidget, QTableWidgetItem,
    QFileDialog, QMessageBox, QHeaderView
)
from PyQt6.QtGui import QFont, QIcon
from PyQt6.QtCore import Qt
import parsing

# Get the absolute path of the directory where the script is located
basedir = os.path.dirname(__file__)

class GitInsightsApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Git Insights Excelerator")
        self.setGeometry(100, 100, 800, 600)

        # Set the application icon
        self.setWindowIcon(QIcon(os.path.join(basedir, "favicon.ico")))

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        self.layout = QVBoxLayout(self.central_widget)

        # Repo Path Input
        repo_layout = QHBoxLayout()
        self.repo_path_input = QLineEdit()
        self.repo_path_input.setPlaceholderText("Enter Git repository path...")
        repo_layout.addWidget(self.repo_path_input)

        browse_button = QPushButton("Browse")
        browse_button.clicked.connect(self.browse_folder)
        repo_layout.addWidget(browse_button)
        self.layout.addLayout(repo_layout)

        # Branch Input
        self.branch_input = QLineEdit()
        self.branch_input.setPlaceholderText("Enter branch name (e.g., main)")
        self.layout.addWidget(self.branch_input)


        self.group_button = QPushButton("Group Commits")
        self.group_button.clicked.connect(self.group_commits)
        self.layout.addWidget(self.group_button)

        # Results Section
        self.results_table = QTableWidget()
        self.results_table.setColumnCount(5)
        self.results_table.setHorizontalHeaderLabels(["S.No.", "Group Title", "Group Date", "Author", "Commit Message"])
        header = self.results_table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.layout.addWidget(self.results_table)


        self.download_button = QPushButton("Download CSV")
        self.download_button.clicked.connect(self.download_csv)
        self.layout.addWidget(self.download_button)

        self.grouped_commits = None

        self.setStyleSheet(open(os.path.join(basedir, "styles.qss")).read())

    def browse_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select Git Repository")
        if folder_path:
            self.repo_path_input.setText(folder_path)

    def group_commits(self):
        repo_path = self.repo_path_input.text()
        branch = self.branch_input.text()

        if not repo_path or not branch:
            QMessageBox.warning(self, "Warning", "Please provide both a repository path and a branch name.")
            return

        try:
            commit_log = self.get_git_log(repo_path, branch)
        except FileNotFoundError:
            QMessageBox.critical(self, "Error", f"The specified repository path does not exist: {repo_path}")
            return
        except subprocess.CalledProcessError as e:
            QMessageBox.critical(self, "Error", f"An error occurred while fetching the git log:\n{e.stderr.decode('utf-8')}")
            return


        self.grouped_commits = parsing.group_commits(commit_log)

        self.results_table.setRowCount(0)
        if not self.grouped_commits:
            QMessageBox.information(self, "No Groups Found", "Could not group any commits. Check your commit log format or branch name.")
            return

        self.results_table.setRowCount(len(self.grouped_commits))
        for row, commit_info in enumerate(self.grouped_commits):
            self.results_table.setItem(row, 0, QTableWidgetItem(str(row + 1)))
            self.results_table.setItem(row, 1, QTableWidgetItem(commit_info['title']))
            self.results_table.setItem(row, 2, QTableWidgetItem(commit_info['date']))
            self.results_table.setItem(row, 3, QTableWidgetItem(commit_info['author']))
            self.results_table.setItem(row, 4, QTableWidgetItem(commit_info['message']))


    def get_git_log(self, repo_path, branch):
        command = [
            "git",
            "-C",
            repo_path,
            "log",
            branch,
            '--pretty=format:%an | %ad | %s',
            '--date=iso8601-strict',
            '--no-merges' # Exclude merge commits
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8')
        return result.stdout


    def download_csv(self):
        if not self.grouped_commits:
            QMessageBox.warning(self, "Warning", "No grouped commits to download.")
            return

        file_path, _ = QFileDialog.getSaveFileName(self, "Save CSV", "grouped_commits.csv", "CSV Files (*.csv)")
        if file_path:
            parsing.download_csv(self.grouped_commits, file_path)
            QMessageBox.information(self, "Success", f"CSV file saved to {file_path}")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = GitInsightsApp()
    window.show()
    sys.exit(app.exec())