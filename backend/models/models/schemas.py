from typing import List, Dict, Any, Union, Optional
from pydantic import BaseModel, Field, ConfigDict, conlist, confloat, validator

class AnnotationData(BaseModel):
    bbox: List[int] = Field(..., min_items=4, max_items=4)
    class_name: str = Field(alias="class")
    species_probabilities: List[Dict[str, Any]]
    hollows: float = Field(..., ge=0.0, le=1.0)
    cracks: float = Field(..., ge=0.0, le=1.0)
    stem_damage: float = Field(..., ge=0.0, le=1.0)
    crown_damage: float = Field(..., ge=0.0, le=1.0)
    fruiting_bodies: float = Field(..., ge=0.0, le=1.0)
    diseases: List[Dict[str, Any]]
    dry_branches_percentage: float = Field(..., ge=0.0, le=100.0)

    model_config = ConfigDict(populate_by_name=True)

class ImageAnnotation(BaseModel):
    img_path: str
    annotations: List[AnnotationData]

class DatasetInfo(BaseModel):
    name: str
    description: str
    images_count: int
    annotations_count: int
    created_at: str

class TrainingConfig(BaseModel):
    dataset_name: str
    model_type: str
    epochs: int = 50
    batch_size: int = 32
    learning_rate: float = 1e-4
    validation_split: float = 0.2

class PredictionResult(BaseModel):
    bbox: conlist(int)
    class_name: str
    species: Union[str, List[str]] = []
    species_confidence: Union[confloat(ge=0.0, le=1.0), List[confloat(ge=0.0, le=1.0)]]

    hollows: confloat(ge=0.0, le=1.0)
    cracks: confloat(ge=0.0, le=1.0)
    stem_damage: confloat(ge=0.0, le=1.0)
    crown_damage: confloat(ge=0.0, le=1.0)
    fruiting_bodies: confloat(ge=0.0, le=1.0)

    dry_branches_percentage: confloat(ge=0.0, le=100.0)

    diseases: Union[str, List[str]] = []
    species_confidence: Union[confloat(ge=0.0, le=1.0), List[confloat(ge=0.0, le=1.0)]]

    @validator("bbox", pre=True)
    def _bbox_to_ints(cls, v):
        if isinstance(v, (list, tuple)) and len(v) == 4:
            return [int(x) for x in v]
        return v

    @validator("diseases", pre=True)
    def _diseases_to_list(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            return [v] if v else []
        if isinstance(v, list):
            out = []
            for item in v:
                if isinstance(item, str) and item:
                    out.append(item)
                elif isinstance(item, dict) and item.get("disease"):
                    out.append(str(item["disease"]))
            return out
        return []

class ApiResponse(BaseModel):
    filename: str
    results: List[PredictionResult]
    error: Optional[str] = None