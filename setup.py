from setuptools import setup, find_packages


setup(
    name='arachnio',
    version='0.1',
    packages=find_packages(),
    install_requires=['logbook', 'tornado', 'flask', 'click'],
    entry_points={
        'console_scripts': [
            'arachnio = backend.server:main'
        ]
    }
)
