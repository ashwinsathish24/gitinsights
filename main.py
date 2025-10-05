import sys
import os
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget,
    QTextEdit, QPushButton, QLabel, QTreeWidget, QTreeWidgetItem,
    QFileDialog, QMessageBox
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

        # Header
        header_layout = QVBoxLayout()
        title_label = QLabel("Git Insights Excelerator")
        title_label.setFont(QFont("PT Sans", 24, QFont.Weight.Bold))
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header_layout.addWidget(title_label)

        subtitle_label = QLabel("Group your Git commits locally and export them to CSV.")
        subtitle_label.setFont(QFont("PT Sans", 12))
        subtitle_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header_layout.addWidget(subtitle_label)
        self.layout.addLayout(header_layout)

        # Git Command Display
        git_command_label = QLabel('git log --pretty=format:"%an | %ad | %s" --date=iso')
        git_command_label.setFont(QFont("Source Code Pro", 10))
        git_command_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        git_command_label.setStyleSheet("background-color: #ECF0F1; padding: 10px; border-radius: 5px;")
        self.layout.addWidget(git_command_label)


        # Input Section
        self.commit_log_input = QTextEdit()
        self.commit_log_input.setPlaceholderText("e.g., John Doe | 2024-01-01T12:00:00+0000 | Fix: Resolved issue...")
        self.commit_log_input.setFont(QFont("Source Code Pro", 10))
        self.layout.addWidget(self.commit_log_input)

        self.group_button = QPushButton("Group Commits")
        self.group_button.clicked.connect(self.group_commits)
        self.layout.addWidget(self.group_button)

        # Results Section
        self.results_tree = QTreeWidget()
        self.results_tree.setHeaderLabels(["Title", "Date", "Commits"])
        self.results_tree.header().setStretchLastSection(False)
        self.layout.addWidget(self.results_tree)

        self.download_button = QPushButton("Download CSV")
        self.download_button.clicked.connect(self.download_csv)
        self.layout.addWidget(self.download_button)

        self.grouped_commits = None

        self.setStyleSheet(open(os.path.join(basedir, "styles.qss")).read())

    def group_commits(self):
        commit_log = self.commit_log_input.toPlainText()
        if not commit_log.strip():
            QMessageBox.warning(self, "Warning", "Commit log is empty.")
            return

        self.grouped_commits = parsing.group_commits(commit_log)

        self.results_tree.clear()
        if not self.grouped_commits:
            QMessageBox.information(self, "No Groups Found", "Could not group any commits. Check your commit log format.")
            return

        for group in self.grouped_commits:
            group_item = QTreeWidgetItem(self.results_tree, [group['title'], group['date'], str(len(group['commits']))])
            for commit in group['commits']:
                commit_item = QTreeWidgetItem(group_item, [f"{commit['author']}: {commit['message']}"])


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