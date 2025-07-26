from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="smartshot",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="A tool to watch for and organize screenshots",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/smartshot",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    install_requires=[
        "watchdog>=2.1.6",
        "click>=8.1.3",
        "python-dotenv>=0.19.0",
    ],
    entry_points={
        'console_scripts': [
            'smartshot=smartshot.main:cli',
        ],
    },
)
