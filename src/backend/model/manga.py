from django.db import models


class Manga(models.Model):

    univers = models.CharField(max_length=100)
    numero_tome = models.PositiveIntegerField(null=True, blank=True)
    classe_yolo = models.CharField(
        max_length=150,
        unique=True,
        help_text="Nom exact de la classe dans data.yaml (ex: one-piece_tome_1)",
    )
    nom_affichage = models.CharField(max_length=150)

    class Meta:
        ordering = ["univers", "numero_tome"]

    def __str__(self) -> str:
        return self.nom_affichage

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "univers": self.univers,
            "numero_tome": self.numero_tome,
            "classe_yolo": self.classe_yolo,
            "nom_affichage": self.nom_affichage,
        }
