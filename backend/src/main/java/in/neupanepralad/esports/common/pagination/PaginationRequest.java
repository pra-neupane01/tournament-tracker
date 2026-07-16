package in.neupanepralad.esports.common.pagination;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class PaginationRequest {
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";

    public Pageable toPageable(List<String> allowedSortProperties) {
        int safePage = Math.max(0, this.page);
        int safeSize = this.size <= 0 ? 20 : Math.min(this.size, 100);

        String actualSortBy = allowedSortProperties != null && allowedSortProperties.contains(this.sortBy) 
                ? this.sortBy : "createdAt";
                
        Sort.Direction direction = "asc".equalsIgnoreCase(this.sortDirection) 
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        return PageRequest.of(safePage, safeSize, Sort.by(direction, actualSortBy));
    }
}
