import torch.nn as nn

class LinearClassifier(nn.Module):
    def __init__(self, embedding_dim: int, num_classes: int, hidden_dim: int = 256, dropout_rate: float = 0.4):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x):
        return self.layers(x)

class RegressionModel(nn.Module):
    def __init__(self, embedding_dim: int, output_dim: int, hidden_dim: int = 256, dropout_rate: float = 0.4):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, output_dim),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.layers(x)
